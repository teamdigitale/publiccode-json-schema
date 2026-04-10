import S from "fluent-json-schema";

export default S.string().description("The name of the software");

export const formFields = [
	{
		id: "name",
		type: "text",
		label: "Software Name",
		group: "basic",
		placeholder: "Enter the public name of your software",
		validation: {
			required: true,
			minLength: 2,
			maxLength: 100,
			customMessage:
				"Software name is required and must be between 2-100 characters",
		},
		helpText: "The public name most people refer to your software",
	},
];
