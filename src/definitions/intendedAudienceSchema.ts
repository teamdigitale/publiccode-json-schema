import S from "fluent-json-schema";
import { scopes } from "../constants";

export default S.object()
	.id("#intendedAudience")
	.title("Intended Audience")
	.additionalProperties(false)
	.description("Schema for Intended Audience information")
	.prop(
		"countries",
		S.array()
			.items(S.string().pattern("^[A-Z]{2}$"))
			.description(
				"This key explicitly includes certain countries in the intended audience, i.e. the software explicitly claims compliance with specific processes, technologies or laws. All countries are specified using ISO 3166-1 alpha-2 two-letter country codes.",
			),
	)
	.prop(
		"unsupportedCountries",
		S.array()
			.items(S.string().pattern("^[A-Z]{2}$"))
			.description(
				"This key explicitly marks countries as NOT supported. This might be the case if there is a conflict between how software is working and a specific law, process or technology. All countries are specified using ISO 3166-1 alpha-2 two-letter country codes.",
			),
	)
	.prop(
		"scope",
		S.array()
			.items(S.string().enum(scopes))
			.description(
				"This key contains a list of tags related to the field of application of the software.",
			),
	);

export const formFields = [
	{
		id: "intendedAudience_countries",
		type: "array",
		label: "Target Countries",
		group: "audience",
		arrayConfig: {
			itemFields: [
				{
					id: "country",
					type: "text",
					label: "Country Code",
					placeholder: "US, IT, DE, FR, etc.",
					validation: {
						required: true,
						pattern: "^[A-Z]{2}$",
						minLength: 2,
						maxLength: 2,
						customMessage:
							"Enter a valid ISO 3166-1 alpha-2 country code (e.g., US, IT)",
					},
				},
			],
			minItems: 0,
			maxItems: 50,
			initialItems: 0,
			addButtonText: "Add Country",
			removeButtonText: "Remove",
			itemTitle: "Country {index}",
		},
		helpText:
			"Countries for which the software claims specific compliance (ISO 3166-1 alpha-2)",
	},
	{
		id: "intendedAudience_scope",
		type: "multiselect",
		label: "Application Scope",
		group: "audience",
		options: scopes.map((v) => ({ value: v, label: v })),
		validation: {
			minSelection: 0,
		},
		helpText: "Fields of application for the software",
	},
];

// const intendedAudienceSchema = {
// 	type: "object",
// 	additionalProperties: false,
// 	properties: {
// 		countries: {
// 			description:
// 				"This key explicitly includes certain countries in the intended audience, i.e. the software explicitly claims compliance with specific processes, technologies or laws. All countries are specified using ISO 3166-1 alpha-2 two-letter country codes.",
// 			type: "array",
// 			items: {
// 				type: "string",
// 				pattern: "^[A-Z]{2}$",
// 			},
// 		},
// 		unsupportedCountries: {
// 			description:
// 				"This key explicitly marks countries as NOT supported. This might be the case if there is a conflict between how software is working and a specific law, process or technology. All countries are specified using ISO 3166-1 alpha-2 two-letter country codes.",
// 			type: "array",
// 			items: {
// 				type: "string",
// 				pattern: "^[A-Z]{2}$",
// 			},
// 		},
// 		scope: {
// 			description:
// 				"This key contains a list of tags related to the field of application of the software.",
// 			type: "array",
// 			items: {
// 				enum: [
// 					"agriculture",
// 					"culture",
// 					"defence",
// 					"education",
// 					"emergency-services",
// 					"employment",
// 					"energy",
// 					"environment",
// 					"finance-and-economic-development",
// 					"foreign-affairs",
// 					"government",
// 					"healthcare",
// 					"infrastructures",
// 					"justice",
// 					"local-authorities",
// 					"manufacturing",
// 					"research",
// 					"science-and-technology",
// 					"security",
// 					"society",
// 					"sport",
// 					"tourism",
// 					"transportation",
// 					"welfare",
// 				],
// 			},
// 		},
// 	},
// };
