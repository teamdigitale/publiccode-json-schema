// Validation of publiccode.yml v0 files with the same rules as publiccode-parser-go,
// moved here from publiccode-editor so that the editor and other tools share one copy.
export {
  validate,
  validateVersion,
  checkFormat,
  SCHEMA_VERSIONS,
  SUPPORTED_VERSIONS,
  type Err,
  type Result,
  type ValidateOptions,
  type VersionResult,
  type VersionValidateOptions,
} from "./validate";
export { formats } from "./formats";
export type { Issue } from "./checks";
