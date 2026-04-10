import S from "fluent-json-schema";
import { platforms } from "../constants";

export default S.array()
	.items(S.string().enum(platforms))
	.description(
		"This key specifies which platform the software runs on. It is meant to describe the platforms that users will use to access and operate the software, rather than the platform the software itself runs on.\n\nUse the predefined values if possible. If the software runs on a platform for which a predefined value is not available, a different value can be used.",
	);

export const formFields = [
	{
		id: "platforms",
		type: "multiselect",
		label: "Platforms",
		group: "classification",
		options: platforms.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			minSelection: 1,
			customMessage: "Select at least one platform",
		},
		helpText: "Platforms where users can access your software",
	},
];
