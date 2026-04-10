import S from "fluent-json-schema";

// const legalSchema = {
// 	type: "object",
// 	additionalProperties: false,
// 	required: ["license"],
// 	properties: {
// 		license: {
// 			description:
// 				"This string describes the license under which the software is distributed. The string must contain a valid SPDX expression, referring to one (or multiple) open-source license. Please refer to the SPDX documentation for further information.",
// 			type: "string",
// 		},
// 		mainCopyrightOwner: {
// 			description:
// 				"This string describes the entity that owns the copyright on "most" of the code in the repository. Normally, this is the line that is reported with the copyright symbol at the top of most files in the repo.\n\nIt is possible to list multiple owners if required so, using an English sentence. It is also possible to informally refer to a community of group of people like "Linus Torvalds and all Linux contributors".\n\nIn case it is not possible to name a main copyright owner, it is possible to omit this key; in those cases, if the repo has a authors file, you can point to it through legal/authorsFile.',
// 			type: "string",
// 		},
// 		repoOwner: {
// 			description:
// 				"This string describes the entity that owns this repository; this might or might not be the same entity who owns the copyright on the code itself. For instance, in case of a fork of the original software, the repoOwner is probably different from the mainCopyrightOwner.",
// 			type: "string",
// 		},
// 		authorsFile: {
// 			description:
// 				"Some open-source software adopt a convention of identify the copyright holders through a file that lists all the entities that own the copyright. This is common in projects strongly backed by a community where there are many external contributors and no clear single/main copyright owner. In such cases, this key can be used to refer to the authors file, using a path relative to the root of the repository.",
// 			type: "string",
// 		},
// 	},
// };

export default S.object()
	.id("#legal")
	.title("Legal Information")
	.description("Schema for legal information")
	.additionalProperties(false)
	.prop(
		"license",
		S.string().description(
			"This string describes the license under which the software is distributed. The string must contain a valid SPDX expression, referring to one (or multiple) open-source license. Please refer to the SPDX documentation for further information.",
		),
	)
	.prop(
		"mainCopyrightOwner",
		S.string().description(
			"This string describes the entity that owns the copyright on 'most' of the code in the repository. Normally, this is the line that is reported with the copyright symbol at the top of most files in the repo.\n\nIt is possible to list multiple owners if required so, using an English sentence. It is also possible to informally refer to a community of group of people like 'Linus Torvalds and all Linux contributors'.\n\nIn case it is not possible to name a main copyright owner, it is possible to omit this key; in those cases, if the repo has a authors file, you can point to it through legal/authorsFile.",
		),
	)
	.prop(
		"repoOwner",
		S.string().description(
			"This string describes the entity that owns this repository; this might or might not be the same entity who owns the copyright on the code itself. For instance, in case of a fork of the original software, the repoOwner is probably different from the mainCopyrightOwner.",
		),
	)
	.prop(
		"authorsFile",
		S.string().description(
			"Some open-source software adopt a convention of identify the copyright holders through a file that lists all the entities that own the copyright. This is common in projects strongly backed by a community where there are many external contributors and no clear single/main copyright owner. In such cases, this key can be used to refer to the authors file, using a path relative to the root of the repository.",
		),
	)
	.required(["license"]);

export const formFields = [
	{
		id: "legal_license",
		type: "text",
		label: "License",
		group: "legal",
		placeholder: "MIT, GPL-3.0-or-later, Apache-2.0",
		validation: {
			required: true,
			minLength: 2,
			maxLength: 100,
			customMessage: "License is required (use SPDX expression)",
		},
		helpText: "SPDX license expression (required)",
	},
	{
		id: "legal_mainCopyrightOwner",
		type: "text",
		label: "Main Copyright Owner",
		group: "legal",
		placeholder: "Organization Name or Individual",
		validation: {
			maxLength: 200,
		},
		helpText: "Entity that owns copyright on most of the code",
	},
	{
		id: "legal_repoOwner",
		type: "text",
		label: "Repository Owner",
		group: "legal",
		placeholder: "Organization or Individual",
		validation: {
			maxLength: 200,
		},
		helpText: "Entity that owns this repository",
	},
];
