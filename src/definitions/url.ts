import S from "fluent-json-schema";

export default S.string().minLength(1).raw({ format: "url_url" }).description("The URL of the software");
