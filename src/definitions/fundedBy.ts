import S from "fluent-json-schema";

export default S.array()
	.items(S.ref("#organisation"))
	.description(
		"A list of organisations that are currently known to be funding the development of this software.",
	);
