import S from "fluent-json-schema";

export default S.string()
	.format("date")
	.description("The release date of the current version");

export const formFields = [
	{
		id: "releaseDate",
		type: "date",
		label: "Release Date",
		group: "basic",
		validation: {
			maxDate: new Date().toISOString().split("T")[0],
			customMessage: "Release date cannot be in the future",
		},
		helpText: "Date of the latest release",
	},
];
