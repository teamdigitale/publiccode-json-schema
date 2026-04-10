import S from "fluent-json-schema";

export default S.array().items(S.ref("#dependsOn"));
