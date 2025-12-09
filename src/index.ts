import fs from "fs/promises";
import S from "fluent-json-schema";
import {
	contactSchema,
	contractorSchema,
	dependencySchema,
	dependsOnSchema,
	descriptionSchema,
	intendedAudienceSchema,
	ITSchema,
	legalSchema,
	localisationSchema,
	maintenanceSchema,
	organisationSchema,
} from "./definitions/index.js";

import * as CONSTS from "./constants.js";

const currentVersion = "0.5.1";

const schema = S.object()
	.id(`publicode/root/v${currentVersion}`)
	.title("PublicCode JSON Schema")
	.additionalProperties(false)
	.description(
		"publiccode.yml is a metadata standard for repositories containing software developed or acquired by the Public Administration, aimed at making them easily discoverabile and thus reusable by other entities.\n\nBy including a publiccode.yml file in the root of a repository, and populating it with information about the software, technicians and civil servants can evaluate it. Automatic indexing tools can also be built, since the format is easily readable by both humans and machines.\n\npubliccode.yml is mandatory for all public software developed in Italy, according to the national guidelines: this enables the Developers Italia crawler to build the national software catalog. The standard is designed to be interoperable internationally, thus the country-specific keys are separated by the core part and are defined in specific sections that each government can rule.",
	)
	.definition("contact", contactSchema)
	.definition("contractor", contractorSchema)
	.definition("organisation", organisationSchema)
	.definition("dependency", dependencySchema)
	.definition("dependsOn", dependsOnSchema)
	.definition("description", descriptionSchema)
	.definition("intendedAudience", intendedAudienceSchema)
	.definition("legal", legalSchema)
	.definition("localisation", localisationSchema)
	.definition("maintenance", maintenanceSchema)
	.definition("IT", ITSchema)
	// .prop("version", S.string())

	.prop("publiccodeYmlVersion", S.string().enum(CONSTS.versions))
	.prop("name", S.string().description("The name of the software"))
	.prop(
		"applicationSuite",
		S.string().description(
			"The name of the application suite this software belongs to",
		),
	)
	.prop("url", S.string().format("uri").description("The URL of the software"))
	.prop(
		"landingURL",
		S.string().format("uri").description("The landing page URL"),
	)
	.prop(
		"isBasedOn",
		S.oneOf([S.string(), S.array().items(S.string())]).description(
			"In case this software is a variant or a fork of another software, which might or might not contain a publiccode.yml file, this key will contain the url of the original project(s).The existence of this key identifies the fork as a software variant, descending from the specified repositories.",
		),
	)
	.prop(
		"softwareVersion",
		S.string().description(
			"This key contains the latest stable version number of the software. The version number is a string that is not meant to be interpreted and parsed but just displayed; parsers should not assume semantic versioning or any other specific version format.The key can be omitted if the software is currently in initial development and has never been released yet.",
		),
	)
	.prop(
		"releaseDate",
		S.string()
			.format("date")
			.description("The release date of the current version"),
	)
	.prop(
		"logo",
		S.string().description(
			"This key contains the path to the logo of the software. Logos should be in vector format; raster formats are only allowed as a fallback. In this case, they should be transparent PNGs, minimum 1000px of width. The key value can be the relative path to the file starting from the root of the repository, or it can be an absolute URL pointing to the logo in raw version. In both cases, the file must reside inside the same repository where the publiccode.yml file is stored.",
		),
	)
	.prop(
		"monochromeLogo",
		S.string().description(
			"A monochromatic (black) logo. The logo should be in vector format; raster formats are only allowed as a fallback. In this case, they should be transparent PNGs, minimum 1000px of width. The key value can be the relative path to the file starting from the root of the repository, or it can be an absolute URL pointing to the logo in raw version. In both cases, the file must reside inside the same repository where the publiccode.yml file is stored.",
		),
	)
	.prop(
		"inputTypes",
		S.array()
			.items(S.string())
			.description(
				"A list of Media Types (MIME Types) as mandated in RFC 6838 which the application can handle as input. In case the software does not support any input, you can skip this field or use application/x.empty.",
			),
	)
	.prop(
		"outputTypes",
		S.array()
			.items(S.string())
			.description(
				"A list of Media Types (MIME Types) as mandated in RFC 6838 which the application can handle as output. In case the software does not support any output, you can skip this field or use application/x.empty.",
			),
	)
	.prop(
		"platforms",
		S.array()
			.items(S.string())
			.enum(CONSTS.platforms)
			.description(
				"This key specifies which platform the software runs on. It is meant to describe the platforms that users will use to access and operate the software, rather than the platform the software itself runs on.\n\nUse the predefined values if possible. If the software runs on a platform for which a predefined value is not available, a different value can be used.",
			),
	)
	.prop(
		"categories",
		S.array()
			.items(S.string())
			.enum(CONSTS.categories)
			.description(
				"A list of words that can be used to describe the software and can help building catalogs of open software.",
			),
	)
	.prop(
		"usedBy",
		S.array()
			.items(S.string())
			.description(
				'A list of the names of prominent public administrations (that will serve as "testimonials") that are currently known to the software maintainer to be using this software.\n\nParsers are encouraged to enhance this list also with other information that can obtain independently; for instance, a fork of a software, owned by an administration, could be used as a signal of usage of the software.',
			),
	)
	.prop(
		"roadmap",
		S.string()
			.format("uri")
			.description("A link to a public roadmap of the software."),
	)
	.prop("developmentStatus", S.string().enum(CONSTS.statuses))
	.prop("softwareType", S.string().enum(CONSTS.kinds))
	.prop("intendedAudience", S.array().items(S.string().pattern("^[A-Z]{2}$")))
	.prop("description", S.ref("#description"))
	.prop("legal", S.ref("#legal"))
	.prop("maintenance", S.ref("#maintenance"))
	.prop("localisation", S.ref("#localisation"))
	.prop("dependsOn", S.array().items(S.ref("#dependsOn")))
	.prop("organisation", S.ref("#organisation"))
	.prop(
		"fundedBy",
		S.array()
			.items(S.ref("#organisation"))
			.description(
				"A list of organisations that are currently known to be funding the development of this software.",
			),
	)
	.prop("IT", S.ref("#IT"))
	.required([
		"publiccodeYmlVersion",
		"name",
		"url",
		"platforms",
		"developmentStatus",
		"softwareType",
		"description",
		"legal",
		"maintenance",
		"localisation",
	]);

const str = JSON.stringify(schema.valueOf(), undefined, 2);

fs.writeFile(`data/publicode_schema_v${currentVersion}.json`, str).then(() => {
	console.log("schema generated");
});
