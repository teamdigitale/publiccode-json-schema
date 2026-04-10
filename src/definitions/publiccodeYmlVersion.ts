import S from "fluent-json-schema";
import { versions } from "../constants";

export default S.string().enum(versions);

export const formFields = [
	{
		id: "publiccodeYmlVersion",
		type: "select",
		label: "PublicCode.yml Version",
		group: "basic",
		options: versions.map((v, index) => ({
			value: v,
			label: v,
			selected: index === 0,
		})),
		validation: {
			required: true,
		},
		helpText: "Version of the publiccode.yml standard",
	},
];
