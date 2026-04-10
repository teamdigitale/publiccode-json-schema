import S from "fluent-json-schema";
import { categories } from "../constants";

export default S.array()
	.items(S.string().enum(categories))
	.description(
		"A list of words that can be used to describe the software and can help building catalogs of open software.",
	);

export const formFields = [
	{
		id: "categories",
		type: "multiselect",
		label: "Categories",
		group: "classification",
		options: categories.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			minSelection: 1,
			customMessage: "Select at least one category",
		},
		helpText: "Categories that describe your software",
	},
];
