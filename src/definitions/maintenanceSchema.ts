import S from "fluent-json-schema";

// const maintenanceSchema = {
// 	description:
// 		"This section provides information on the maintenance status of the software, useful to evaluate whether the software is actively developed or not.",
// 	type: "object",
// 	additionalProperties: false,
// 	required: ["type"],
// 	properties: {
// 		type: {
// 			description:
// 				"This key describes how the software is currently maintained.",
// 			enum: ["internal", "contract", "community", "none"],
// 		},
// 		contractors: {
// 			description:
// 				"This key describes the entity or entities, if any, that are currently contracted for maintaining the software. They can be companies, organizations, or other collective names.",
// 			type: "array",
// 			items: {
// 				$ref: "#contractor",
// 			},
// 		},
// 		contacts: {
// 			description:
// 				"One or more contacts maintaining this software.\n\nThis key describes the technical people currently responsible for maintaining the software. All contacts need to be a physical person, not a company or an organisation. If somebody is acting as a representative of an institution, it must be listed within the affiliation of the contact.\n\nIn case of a commercial agreement (or a chain of such agreements), specify the final entities actually contracted to deliver the maintenance. Do not specify the software owner unless it is technically involved with the maintenance of the product as well.",
// 			type: "array",
// 			items: {
// 				$ref: "#contact",
// 			},
// 		},
// 	},
// };

export default S.object()
	.id("#maintenance")
	.title("Maintenance Information")
	.description(
		"This section provides information on the maintenance status of the software, useful to evaluate whether the software is actively developed or not.",
	)
	.additionalProperties(false)
	.prop(
		"type",
		S.string()
			.enum(["internal", "contract", "community", "none"])
			.description(
				"This key describes how the software is currently maintained.",
			),
	)
	.prop(
		"contractors",
		S.array()
			.items(S.ref("#contractor"))
			.description(
				"This key describes the entity or entities, if any, that are currently contracted for maintaining the software. They can be companies, organizations, or other collective names.",
			),
	)
	.prop(
		"contacts",
		S.array()
			.items(S.ref("#contact"))
			.description(
				"One or more contacts maintaining this software.\n\nThis key describes the technical people currently responsible for maintaining the software. All contacts need to be a physical person, not a company or an organisation. If somebody is acting as a representative of an institution, it must be listed within the affiliation of the contact.\n\nIn case of a commercial agreement (or a chain of such agreements), specify the final entities actually contracted to deliver the maintenance. Do not specify the software owner unless it is technically involved with the maintenance of the product as well.",
			),
	)
	.required(["type"]);
