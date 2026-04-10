import fs from "fs/promises";
import formSchema from "../src/form-schema";
import pbcdSchema, { currentVersion } from "../src/publiccode-schema";

async function main() {

	await fs.writeFile(`data/publiccode-schema/publiccode-schema-v${currentVersion}.json`, pbcdSchema)
	await fs.writeFile(`data/form-schema/form-schema-v${currentVersion}.json`, formSchema, "utf8");
	console.log("File written successfully");
}

(async () => {
	main();
})();
