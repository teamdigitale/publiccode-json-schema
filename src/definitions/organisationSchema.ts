import S from "fluent-json-schema";

export default S.object()
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
