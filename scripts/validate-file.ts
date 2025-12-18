import fs from "fs/promises";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import YAML from "yaml";
import { console } from "inspector";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function validateFile(schema: any, data: any) {
	const validate = ajv.compile(schema);

	const valid = validate(data);
	console.log("VALID?", valid);
	if (!valid) console.log(validate.errors);
}

async function main() {
	const schemaData = await fs.readFile(
		"data/publiccode_schema_original.json",
		"utf8",
	);
	const ymlData = await fs.readFile("data/yaml/deadcode.yml", "utf8");
	const data = YAML.parse(ymlData);
	const schema = JSON.parse(schemaData);
	if (!schema || !data) return;

	// validateFile(schema.toString(), data.toString());
	const validate = ajv.compile(schema);
	const valid = validate(data);
	if (!valid) {
		console.log("Errors:", validate.errors);
	} else {
		console.log("the data is valid");
	}
}

(async () => {
	main();
})();
