import fs from "node:fs/promises";
import { groups, supports, ui } from "../src/form/ui";
import {
	buildFormSchema,
	buildSchema,
	countries,
	rules,
	SCHEMA_VERSIONS,
} from "../src/index";
import { baseSchema } from "../src/publiccode-schema";

const write = (path: string, data: unknown) =>
	fs.writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");

async function main() {
	// Standard sections only: experimental ones are enabled by consumers.
	const included = countries;
	await fs.mkdir("data/countries", { recursive: true });

	// What the validators use: every 0.x version, like the parser.
	await write(
		"data/publiccode-schema/publiccode-schema-v0.json",
		buildSchema(baseSchema, { countries: included }),
	);

	for (const version of SCHEMA_VERSIONS) {
		const schema = buildSchema(baseSchema, { version, countries: included });
		await write(`data/publiccode-schema/publiccode-schema-v${version}.json`, schema);

		const form = buildFormSchema(schema, { version, ui, groups, countries: included, supports });
		await write(`data/form-schema/form-schema-v${version}.json`, form);
	}

	// Country packages as data, for consumers that don't run TypeScript.
	for (const c of countries) {
		const { deprecations: _, ...rest } = c;
		await write(`data/countries/${c.id}.json`, {
			...rest,
			deprecations: rules([c])
				.filter((r) => r.country === c.id)
				.map(({ id, since, message, parser, lossy }) => ({ id, since, message, parser, lossy })),
		});
	}

	console.log(
		`Wrote the v0 schema, ${SCHEMA_VERSIONS.length} versioned schemas and form schemas, ${countries.length} country files`,
	);
}

await main();
