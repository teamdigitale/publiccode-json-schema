import S from "fluent-json-schema";
import { platforms } from "../constants";

// The parser only requires at least one platform: the predefined values are a
// suggestion ("a different value can be used"), so they're examples, not an enum.
export default S.array()
	.minItems(1)
	.items(S.string().examples(platforms))
	.description(
		"This key specifies which platform the software runs on. It is meant to describe the platforms that users will use to access and operate the software, rather than the platform the software itself runs on.\n\nUse the predefined values if possible. If the software runs on a platform for which a predefined value is not available, a different value can be used.",
	);
