import fs from "fs/promises";
import S from "fluent-json-schema";

const version = "0.4";

const schema = S.object()
  .id(`publicode/root/v${version}`)
  .title("Main JSON Schema")
  .description("The main schema")
  .prop("version", S.string());

const str = JSON.stringify(schema.valueOf(), undefined, 2);

fs.writeFile(`data/publicode_schema_v${version}.json`, str).then(() => {
  console.log("schema generated");
});
