import S from "fluent-json-schema";

export default S.array()
	.items(S.string())
	.description(
		"A list of Media Types (MIME Types) as mandated in RFC 6838 which the application can handle as input. In case the software does not support any input, you can skip this field or use application/x.empty.",
	);
