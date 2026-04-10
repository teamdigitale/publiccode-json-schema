import S from "fluent-json-schema";

export default S.string().format("uri").description("The landing page URL");

export const formFields = [
	{
		id: "landingURL",
		type: "text",
		label: "Landing Page URL",
		group: "basic",
		placeholder: "https://example.com/software",
		validation: {
			url: true,
		},
		helpText: "Optional: User-friendly landing page for your software",
	},
];
