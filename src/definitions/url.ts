import S from "fluent-json-schema";

export default S.string().format("uri").description("The URL of the software");

export const formFields = [
	{
		id: "url",
		type: "text",
		label: "Repository URL",
		group: "basic",
		placeholder: "https://github.com/organization/repository",
		validation: {
			required: true,
			url: true,
			customMessage: "Please enter a valid repository URL",
		},
		helpText: "URL to the source code repository (git, svn, etc.)",
	},
];
