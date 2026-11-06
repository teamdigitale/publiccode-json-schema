import S from "fluent-json-schema";

// A single URL or a list of URLs. `format` only applies to strings and
// `items` only to arrays, so no oneOf is needed (and errors stay readable).
export default S.mixed(["string", "array"] as never)
	.raw({ format: "url_url", items: { type: "string", format: "url_url" } })
	.description(
		"In case this software is a variant or a fork of another software, which might or might not contain a publiccode.yml file, this key will contain the url of the original project(s).The existence of this key identifies the fork as a software variant, descending from the specified repositories.",
	);
