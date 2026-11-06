import S from "fluent-json-schema";

export default S.string()
	.format("date")
	.description("The release date of the current version");
