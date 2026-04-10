import S from "fluent-json-schema";
import { kinds } from "../constants";

export default S.string().enum(kinds);

export const formFields = [
	{
		id: "softwareType",
		type: "select",
		label: "Software Type",
		group: "classification",
		options: kinds.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			required: true,
		},
		helpText: "Type of software",
	},
];
