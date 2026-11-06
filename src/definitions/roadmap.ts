import S from "fluent-json-schema";

export default S.string()
	.raw({ format: "url_http_url" })
	.description("A link to a public roadmap of the software.");
