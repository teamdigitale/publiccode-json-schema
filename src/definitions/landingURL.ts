import S from "fluent-json-schema";

export default S.string().raw({ format: "url_http_url" }).description("The landing page URL");
