// Build of the npm package into dist/:
//   - JavaScript: ESM bundles of the two public entrypoints (the JSON schemas and
//     vocabularies they import are inlined; ajv and ajv-formats stay external);
//   - types: .d.ts files from tsc (tsconfig.build.json).
//
//   bun run build
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

const entrypoints = ["src/index.ts", "src/validator/index.ts"];

await rm("dist", { recursive: true, force: true });

const result = await Bun.build({
  entrypoints,
  outdir: "dist",
  root: "src",
  target: "node",
  format: "esm",
  splitting: true,
  packages: "external",
  sourcemap: "linked",
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const tsc = Bun.spawnSync(["bunx", "tsc", "-p", "tsconfig.build.json"], { stdout: "inherit", stderr: "inherit" });
if (tsc.exitCode !== 0) process.exit(tsc.exitCode ?? 1);

// The sources use extensionless relative imports (fine for bundlers), but projects with
// "moduleResolution": "node16"/"nodenext" need explicit extensions in .d.ts files too:
// "./lib/versions" -> "./lib/versions.js", "./countries" -> "./countries/index.js".
const relative = /(from\s+|import\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\2/g;
let rewritten = 0;
for await (const file of new Bun.Glob("dist/types/**/*.d.ts").scan()) {
  const dir = path.dirname(file);
  const source = await Bun.file(file).text();
  const out = source.replace(relative, (whole, prefix: string, quote: string, spec: string) => {
    if (/\.(js|json)$/.test(spec)) return whole;
    const target = path.join(dir, spec);
    let fixed: string;
    if (existsSync(`${target}.d.ts`)) fixed = `${spec}.js`;
    else if (existsSync(path.join(target, "index.d.ts"))) fixed = `${spec}/index.js`;
    else throw new Error(`${file}: cannot resolve ${spec}`);
    rewritten++;
    return `${prefix}${quote}${fixed}${quote}`;
  });
  if (out !== source) await Bun.write(file, out);
}

const sizes = result.outputs
  .filter((o) => o.path.endsWith(".js"))
  .map((o) => `${o.path.replace(`${process.cwd()}/`, "")} (${Math.round(o.size / 1024)} KB)`);
console.log(`built ${sizes.join(", ")} + type declarations in dist/types (${rewritten} imports with explicit extensions)`);
