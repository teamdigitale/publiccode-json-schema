import S from "fluent-json-schema";

export default S.object()
	.id("#contact")
	.additionalProperties(false)
	.title("Contact Information")
	.description("Schema for technical contact information")
	.prop(
		"name",
		S.string().description(
			"This key contains the full name of one of the technical contacts. It must be a real person; do NOT populate this key with generic contact information, company departments, associations, etc.",
		),
	)
	.prop(
		"email",
		S.string()
			.format("email")
			.description(
				'This key contains the e-mail address of the technical contact. It must be an email address of where the technical contact can be directly reached; do NOT populate this key with mailing-lists or generic contact points like "info@acme.inc". The e-mail address must not be obfuscated. To improve resistance against e-mail collection, use \\x64 to replace @, as allowed by the YAML specification.',
			),
	)
	.prop(
		"phone",
		S.string().description(
			"Phone number (with international prefix). This has to be a string.",
		),
	)
	.prop(
		"affiliation",
		S.string().description(
			"This key contains an explicit affiliation information for the technical contact. In case of multiple maintainers, this can be used to create a relation between each technical contact and each maintainer entity. It can contain for instance a company name, an association name, etc.",
		),
	)
	.required(["name"]);
