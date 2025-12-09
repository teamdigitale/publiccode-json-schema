import S from "fluent-json-schema";

// const localisationSchema = {
// 	description:
// 		"This section provides an overview of the localization features of the software.",
// 	type: "object",
// 	additionalProperties: false,
// 	required: ["localisationReady", "availableLanguages"],
// 	properties: {
// 		localisationReady: {
// 			description:
// 				"If yes, the software has infrastructure in place or is otherwise designed to be multilingual. It does not need to be available in more than one language.",
// 			type: "boolean",
// 		},
// 		availableLanguages: {
// 			description:
// 				"If present, this is the list of languages in which the software is available. Of course, this list will contain at least one language. The primary language subtag cannot be omitted, as mandated by the BCP 47.",
// 			type: "array",
// 			items: {
// 				type: "string",
// 			},
// 		},
// 	},
// };

export default S.object()
	.id("#localisation")
	.title("Localisation")
	.description(
		"This section provides an overview of the localization features of the software.",
	)
	.additionalProperties(false)
	.prop(
		"localisationReady",
		S.boolean().description(
			"If yes, the software has infrastructure in place or is otherwise designed to be multilingual. It does not need to be available in more than one language.",
		),
	)
	.prop(
		"availableLanguages",
		S.array()
			.items(S.string())
			.description(
				"If present, this is the list of languages in which the software is available. Of course, this list will contain at least one language. The primary language subtag cannot be omitted, as mandated by the BCP 47.",
			),
	)
	.required(["localisationReady", "availableLanguages"]);
