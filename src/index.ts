import fs from "fs/promises";
import S from "fluent-json-schema";
import {
	contactSchema,
	dependencySchema,
	organisationSchema,
	contractorSchema,
} from "./definitions.js";

const version = "0.5.0";

const schema = S.object()
	.id(`publicode/root/v${version}`)
	.title("PublicCode JSON Schema")
	.description(
		"publiccode.yml is a metadata standard for repositories containing software developed or acquired by the Public Administration, aimed at making them easily discoverabile and thus reusable by other entities.\n\nBy including a publiccode.yml file in the root of a repository, and populating it with information about the software, technicians and civil servants can evaluate it. Automatic indexing tools can also be built, since the format is easily readable by both humans and machines.\n\npubliccode.yml is mandatory for all public software developed in Italy, according to the national guidelines: this enables the Developers Italia crawler to build the national software catalog. The standard is designed to be interoperable internationally, thus the country-specific keys are separated by the core part and are defined in specific sections that each government can rule.",
	)
	.definition("contact", contactSchema)
	.definition("dependency", dependencySchema)
	.definition("organisation", organisationSchema)
	.definition("contractor", contractorSchema)
	// .prop("version", S.string())

	.prop(
		"publiccodeYmlVersion",
		S.string().enum([
			"0",
			"0.2",
			"0.2.0",
			"0.2.1",
			"0.2.2",
			"0.3",
			"0.3.0",
			"0.4",
			"0.4.0",
			"0.5",
			"0.5.0",
		]),
	)
	.prop("name", S.string().description("The name of the software"))
	.prop(
		"applicationSuite",
		S.string().description(
			"The name of the application suite this software belongs to",
		),
	)
	.prop("url", S.string().format("uri").description("The URL of the software"))

	.prop("contacts", S.array().items(S.ref("#contact")))
	.prop("organisation", S.ref("organisation"))
	.additionalProperties(false)
	.required([
		"publiccodeYmlVersion",
		"name",
		"url",
		// "platforms",
		// "developmentStatus",
		// "softwareType",
		// "description",
		// "legal",
		// "maintenance",
		// "localisation",
	]);

const str = JSON.stringify(schema.valueOf(), undefined, 2);

fs.writeFile(`data/publicode_schema_v${version}.json`, str).then(() => {
	console.log("schema generated");
});
