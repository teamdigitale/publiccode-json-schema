import fs from "fs/promises";
import data from "../src/form/data";

async function main() {
	await fs.writeFile(
		"data/form-schema/form-schema.json",
		JSON.stringify(data, null, 2),
		"utf8",
	);
	console.log("File written successfully");
}

(async () => {
	main();
})();
