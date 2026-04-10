import S from "fluent-json-schema";

export default S.string()
	.format("uri")
	.description("A link to a public roadmap of the software.");
