import S from "fluent-json-schema";
import { statuses } from "../constants";

export default S.string().enum(statuses);

export const formFields = [
	{
		id: "developmentStatus",
		type: "select",
		label: "Development Status",
		group: "classification",
		options: statuses.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			required: true,
		},
		helpText: "Current development status of the software",
	},
];
