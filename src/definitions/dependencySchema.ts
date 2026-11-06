import S from "fluent-json-schema";

export default S.object()
	.id("#dependency")
	.additionalProperties(false)
	.title("Dependency")
	.description("Schema for Dependencies information")
	.prop(
		"name",
		S.string().minLength(1).description(
			"The name of the dependency (e.g. MySQL, NFC Reader)",
		),
	)
	.prop(
		"version",
		S.string().description(
			"The only major version for which the software is compatible. It assumes compatibility with all patches and bugfixes later applied to this version.",
		),
	)
	.prop(
		"versionMax",
		S.string().description(
			"The latest compatible version",
		),
	)
	.prop(
		"versionMin",
		S.string().description(
			"The first compatible version",
		),
	)
	.prop(
		"optional",
		S.boolean().description("Whether the dependency is optional or mandatory"),
	)
	.required(["name"]);
