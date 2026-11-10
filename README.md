# publiccode-schema

JSON Schema, validator and tools for [publiccode.yml](https://github.com/publiccodeyml/publiccode.yml) files.

- **`publiccode-schema-v0.json`**: validates every 0.x version of the standard with the same rules as [publiccode-parser-go](https://github.com/italia/publiccode-parser-go). Deprecated keys are annotated but accepted.
- **Validator** (`publiccode-schema/validator`): the schema plus what JSON Schema can't express on its own: custom formats with the parser's semantics (SPDX expressions, BCP 47 tags, iPA codes, `organisation.uri`…), lengths counted in grapheme clusters, deprecation warnings and the parser's extra checks.
- **Per-version schemas** (0.2.0 → 0.8.0), **form schemas** for editors, **country packages** (`IT`), and helpers to find deprecated keys and **upgrade** a file.

Used by [publiccode-editor](https://github.com/italia/publiccode-editor) and by the [Developers Italia software catalog](https://developers.italia.it).

## Install

```sh
npm install publiccode-schema
```

ESM only, Node 18 or later, browsers and bundlers. The only runtime dependencies are `ajv` and `ajv-formats`.

## Validate a file

```ts
import { parse } from "yaml";
import { validate } from "publiccode-schema/validator";

const result = validate(parse(fileContents));

for (const e of result.errors) console.log(`error   ${e.key}: ${e.description}`);
for (const w of result.warnings) console.log(`warning ${w.key}: ${w.description}`);
```

`validate()` takes the already-parsed YAML and does no network access: checks such as "the `url` is reachable" or "the logo file exists" are up to the caller. It returns:

| Field | |
|---|---|
| `errors`, `warnings` | `{ key, description, line, column }`, with keys and messages like the parser's (`legal.license`, `description.it.features[0]`…) |
| `publicCode` | the normalized document (numbers and booleans as the parser reads them), or `null` if the version is missing or unsupported |
| `version` | `0` for any supported 0.x file, `null` otherwise |

Country sections that are not in the v0 schema (e.g. experimental ones) can be added with `validate(data, { countries, booleanKeys })`.

### Against one version of the standard

```ts
import { validateVersion } from "publiccode-schema/validator";

const r = await validateVersion(parse(fileContents), { version: "0.4.0", strict: true });
// { valid, errors, warnings, deprecations, declaredVersion, checkedVersion, schema, strict, … }
```

| Option | |
|---|---|
| `version` | the version to check against (`"0.4"` or `"0.4.0"`: the schema of the closest older version is used). Default: the version the file declares, or the latest the parser supports |
| `strict: false` (default) | the parser's rules, the ones that decide whether a file is valid (same result as `validate()`), plus the deprecations up to `version` |
| `strict: true` | the schema of that version only: keys the version doesn't have (`organisation` in a 0.2 file) and the keys it requires (`genericName` before 0.3.0) are errors. A warning says when the file declares another version |

`deprecations` lists what is deprecated up to the checked version (`upgrade()` fixes most of it). The per-version schemas are loaded on demand, so `validateVersion()` returns a promise and `validate()` alone doesn't ship them.

## Use the JSON Schema directly

```ts
import schema from "publiccode-schema/data/publiccode-schema/publiccode-schema-v0.json" with { type: "json" };
```

Files under `data/`:

| Path | |
|---|---|
| `data/publiccode-schema/publiccode-schema-v0.json` | The schema to decide if a file is valid (all 0.x versions, like the parser) |
| `data/publiccode-schema/publiccode-schema-v<X.Y.Z>.json` | One schema per version: only the keys of that version, stricter than the parser. For editors and IDEs |
| `data/form-schema/form-schema-v<X.Y.Z>.json` | Fields to show for a version, with translation keys |
| `data/countries/<id>.json` | Country packages as data (`ita.json`) |
| `data/vocab/*.json` | Vocabularies used by the formats (SPDX, BCP 47, countries, iPA codes, oEmbed schemes…) |

The custom formats are needed to use the schema with your own Ajv instance: `import { formats } from "publiccode-schema/validator"` and register each one with `ajv.addFormat(name, { type: "string", validate })`.

## Labels of the vocabularies

```ts
import { vocabulary, valueLabel } from "publiccode-schema";

vocabulary("categories", { lang: "it" }); // [{ value: "accounting", label: "Contabilità" }, …]
vocabulary("categories", { version: "0.2.0" }); // only the values that exist in 0.2.0
valueLabel("intendedAudience.scope", "local-authorities", "it"); // "Enti locali"
```

Values and labels of the closed vocabularies (`categories`, `intendedAudience.scope`, `developmentStatus`, `softwareType`, `platforms`), with `since` and `deprecated` from the standard's changelog. Labels are in English and Italian; other languages fall back to English (`values` in `src/locales/<lang>.json`).

## Versions, deprecations and upgrades

```ts
import { deprecations, upgrade, schemaVersionFor, LATEST_SUPPORTED } from "publiccode-schema";

schemaVersionFor("0.2.1"); // "0.2.0": the schema for a declared version
deprecations(data); // what's deprecated in a file, since which version, whether the parser reports it too
const { data: upgraded, applied, remaining } = upgrade(data, { to: LATEST_SUPPORTED });
```

`upgrade()` migrates a file as the standard says: `it` → `IT`, lowercase country codes, `IT.riuso.codiceIPA` → `organisation.uri`, `legal.repoOwner` → `organisation.name`, and more. See [docs/versions-and-countries.md](docs/versions-and-countries.md).

## publiccode.yml 1.0

On the `standard-1.0-rc` branch: a 1.0.0 schema that follows the standard's release
candidate (what 0.x deprecated is removed). See [docs/v1.0-rc.md](docs/v1.0-rc.md).

## How close is it to the parser?

[docs/validation-checklist.md](docs/validation-checklist.md) lists every rule of publiccode-parser-go v0, its level (error or warning), whether the schema or the validator covers it, and what is left to the caller (network and file checks).

## Development

Requires [Bun](https://bun.sh).

| Command | |
|---|---|
| `bun install` | Dependencies |
| `bun test` / `bun run typecheck` | Tests and type check |
| `bun run gen` | Regenerates the schemas and form schemas in `data/` from `src/definitions` |
| `bun run vocab` | Regenerates `data/vocab` from the Go modules (requires Go) |
| `bun run build` | Builds the package into `dist/` (ESM bundles + type declarations) |
| `bun run pack:check` | Shows what would be published |

To use a local checkout from another project: `bun run build && bun link` here, then `bun link publiccode-schema` there. Rebuild after each change.

### Release

1. Update `version` in `package.json` and add the entry to [CHANGELOG.md](CHANGELOG.md).
2. Commit, then `git tag v<version> && git push origin v<version>`.
3. The [release workflow](.github/workflows/release.yml) checks that the tag matches `package.json`, runs typecheck, tests and build (`prepublishOnly`) and publishes to npm with provenance.

## License

[AGPL-3.0-or-later](LICENSE).
