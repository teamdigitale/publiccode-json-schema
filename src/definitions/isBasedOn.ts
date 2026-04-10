import S from "fluent-json-schema";

export default S.oneOf([S.string(), S.array().items(S.string())]).description(
	"In case this software is a variant or a fork of another software, which might or might not contain a publiccode.yml file, this key will contain the url of the original project(s).The existence of this key identifies the fork as a software variant, descending from the specified repositories.",
);
