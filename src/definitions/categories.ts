import S from "fluent-json-schema";
import { categories } from "../constants";

export default S.array()
	.items(S.string().enum(categories))
	.description(
		"A list of words that can be used to describe the software and can help building catalogs of open software.",
	);
