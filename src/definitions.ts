import S from "fluent-json-schema";

export const contactSchema = S.object()
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

export const contractorSchema = S.object()
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

export const dependencySchema = S.object()
	.id("#dependency")
	.additionalProperties(false)
	.title("Dependency")
	.description("Schema for Dependencies information")
	.prop(
		"name",
		S.string().description(
			"The name of the dependency (e.g. MySQL, NFC Reader)",
		),
	)
	.prop(
		"version",
		S.oneOf([S.string(), S.number()]).description(
			"The only major version for which the software is compatible. It assumes compatibility with all patches and bugfixes later applied to this version.",
		),
	)
	.prop(
		"versionMax",
		S.oneOf([S.string(), S.number()]).description(
			"The latest compatible version",
		),
	)
	.prop(
		"versionMin",
		S.oneOf([S.string(), S.number()]).description(
			"The first compatible version",
		),
	)
	.prop(
		"optional",
		S.boolean().description("Whether the dependency is optional or mandatory"),
	)
	.required(["name"]);

export const organisationSchema = S.object()
	.id("#organisation")
	.title("Organisation")
	.description("Schema for organisations information")
	.additionalProperties(false)
	.prop(
		"name",
		S.string().description(
			"The canonical name of the organisation publishing the software.",
		),
	)
	.prop(
		"uri",
		S.string()
			.format("uri")
			.description(
				"This key points to the maintainer website. It can either point to the main institutional website, or to a more project-specific page or website.",
			),
	);
