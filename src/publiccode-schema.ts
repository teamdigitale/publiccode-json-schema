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
	// automatedChecksSchema,
} from "./definitions";
import applicationSuite from "./definitions/applicationSuite";
import categories from "./definitions/categories";
import developmentStatus from "./definitions/developmentStatus";
import fundedBy from "./definitions/fundedBy";
import inputTypes from "./definitions/inputTypes";
import isBasedOn from "./definitions/isBasedOn";
import landingURL from "./definitions/landingURL";
import logo from "./definitions/logo";
import monochromeLogo from "./definitions/monochromeLogo";
import name from "./definitions/name";
import outputTypes from "./definitions/outputTypes";
import platforms from "./definitions/platforms";
import publiccodeYmlVersion from "./definitions/publiccodeYmlVersion";
import releaseDate from "./definitions/releaseDate";
import roadmap from "./definitions/roadmap";
import softwareType from "./definitions/softwareType";
import softwareVersion from "./definitions/softwareVersion";
import url from "./definitions/url";
import usedBy from "./definitions/usedBy";

export const currentVersion = "0.5.0";

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
	.prop("publiccodeYmlVersion", publiccodeYmlVersion)
	.prop("name", name)
	.prop("applicationSuite", applicationSuite)
	.prop("url", url)
	.prop("landingURL", landingURL)
	.prop("isBasedOn", isBasedOn)
	.prop("softwareVersion", softwareVersion)
	.prop("releaseDate", releaseDate)
	.prop("logo", logo)
	.prop("monochromeLogo", monochromeLogo)
	.prop("inputTypes", inputTypes)
	.prop("outputTypes", outputTypes)
	.prop("platforms", platforms)
	.prop("categories", categories)
	.prop("usedBy", usedBy)
	.prop("roadmap", roadmap)
	.prop("developmentStatus", developmentStatus)
	.prop("softwareType", softwareType)
	.prop("intendedAudience", S.ref("#intendedAudience"))
	.prop("description", S.ref("#description"))
	.prop("legal", S.ref("#legal"))
	.prop("maintenance", S.ref("#maintenance"))
	.prop("localisation", S.ref("#localisation"))
	.prop("dependsOn", S.ref("#dependsOn"))
	.prop("organisation", S.ref("#organisation"))
	.prop("fundedBy", fundedBy)
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
export default str;

