import S from "fluent-json-schema";

export default S.string().description(
	"The name of the application suite this software belongs to",
);

export const formFields = [
	{
		id: "applicationSuite",
		type: "text",
		label: "Application Suite",
		group: "basic",
		placeholder: "e.g., Office Suite, Developer Tools",
		validation: {
			maxLength: 100,
		},
		helpText: "Optional: The suite to which this software belongs",
	},
];
