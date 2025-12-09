import S from "fluent-json-schema";

export default S.object()
	.id("#contractor")
	.additionalProperties(false)
	.title("Contractor")
	.description("Schema for contractor information")
	.prop(
		"name",
		S.string().description(
			"This key contains the name of the contractor entity.",
		),
	)
	.prop(
		"until",
		S.string().format("date").description("End date of the contract"),
	)
	.prop(
		"email",
		S.string()
			.format("date")
			.description(
				"This key contains the e-mail address of the technical contact. It must be an email address of where the technical contact can be directly reached; do NOT populate this key with mailing-lists or generic contact points like 'info@acme.inc'. The e-mail address must not be obfuscated. To improve resistance against e-mail collection, use \\x64 to replace @, as allowed by the YAML specification.",
			),
	)
	.prop(
		"website",
		S.string()
			.format("uri")
			.description(
				"This key points to the maintainer website. It can either point to the main institutional website, or to a more project-specific page or website.",
			),
	)
	.required(["name", "until"]);
