import S from "fluent-json-schema";

export default S.object()
	.id("#support")
	.title("Support")
	.description(
		"A standard, regulation, framework or system the software supports or complies with.",
	)
	.additionalProperties(false)
	.prop(
		"id",
		S.string()
			.minLength(1)
			.raw({ format: "supports_id" })
			.description(
				"A known alias ('alias:<name>', e.g. 'alias:gdpr') or a URI (URL or URN) identifying what is supported.",
			),
	)
	.required(["id"]);
