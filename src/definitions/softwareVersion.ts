import S from "fluent-json-schema";

export default S.string().description(
	"This key contains the latest stable version number of the software. The version number is a string that is not meant to be interpreted and parsed but just displayed; parsers should not assume semantic versioning or any other specific version format.The key can be omitted if the software is currently in initial development and has never been released yet.",
);
