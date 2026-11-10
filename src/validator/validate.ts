// JSON Schema (Ajv) implementation of the publiccode.yml validation done by
// publiccode-parser-go, returning the same shape as the WASM validator.
import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { withCountries } from "../lib/schema";
import type { CountryExtension } from "../countries/types";
import schema from "../../data/publiccode-schema/publiccode-schema-v0.json";
import { countries as standardCountries } from "../countries";
import { deprecations, type Finding } from "../lib/upgrade";
import {
  ACCEPTED_VERSIONS,
  isAtLeast,
  isVersion,
  LATEST_SUPPORTED,
  normalizeVersion,
  SCHEMA_VERSIONS,
  type SchemaVersion,
  schemaVersionFor,
} from "../lib/versions";
import { checks, type Issue } from "./checks";
import { formats } from "./formats";

// publiccode-parser-go SupportedVersions, plus 0.8 (ACCEPTED_VERSIONS).
export const SUPPORTED_VERSIONS: readonly string[] = ACCEPTED_VERSIONS;
const LATEST = LATEST_SUPPORTED.replace(/\.0$/, "");

export interface Err {
  key: string;
  description: string;
  line: number;
  column: number;
}

export interface Result {
  publicCode: Record<string, unknown> | null;
  errors: Array<Err>;
  warnings: Array<Err>;
  version: number | null;
}

type Data = Record<string, unknown>;

const segmenter = new (
  Intl as unknown as {
    Segmenter: new (
      locale?: string,
      options?: { granularity: "grapheme" },
    ) => { segment: (s: string) => Iterable<unknown> };
  }
).Segmenter(undefined, { granularity: "grapheme" });

// The parser's umax/umin count grapheme clusters, not code points.
const graphemes = (s: string) => {
  let n = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of segmenter.segment(s)) n++;
  return n;
};

function createAjv() {
  const ajv = new Ajv({
    allErrors: true,
    allowUnionTypes: true,
    strictTypes: true,
    verbose: true,
  });

  addFormats(ajv, ["date"]);
  for (const [name, validate] of Object.entries(formats)) {
    ajv.addFormat(name, { type: "string", validate });
  }

  ajv.removeKeyword("maxLength");
  ajv.removeKeyword("minLength");
  ajv.addKeyword({
    keyword: "maxLength",
    type: "string",
    schemaType: "number",
    validate: (max: number, data: string) => graphemes(data) <= max,
  });
  ajv.addKeyword({
    keyword: "minLength",
    type: "string",
    schemaType: "number",
    validate: (min: number, data: string) => graphemes(data) >= min,
  });

  return ajv;
}

let ajv: Ajv | undefined;
let compiled: { ids: string; fn: ReturnType<Ajv["compile"]> } | undefined;
const getAjv = () => (ajv ??= createAjv());

// The v0 schema plus the optional country sections passed by the caller.
function validateSchema(countries: CountryExtension[] = []) {
  const ids = countries.map((c) => c.id).join(",");
  if (compiled?.ids !== ids) {
    // A schema can't be added twice with the same $id: start over.
    if (compiled) ajv = createAjv();
    const s = countries.length > 0 ? withCountries(schema, countries) : schema;
    compiled = { ids, fn: getAjv().compile(s) };
  }

  return compiled.fn;
}

// Runs a single format of the schema (used to test them against the parser).
export function checkFormat(name: string, value: string): boolean {
  const format: unknown = getAjv().formats[name];
  const check =
    typeof format === "object" && format !== null && "validate" in format
      ? format.validate
      : format;

  if (check instanceof RegExp) return check.test(value);
  if (typeof check === "function") return check(value) === true;

  throw new Error(`unknown format ${name}`);
}

const isObject = (v: unknown): v is Data =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// The only non-string scalars in a v0 publiccode.yml.
// Boolean keys of country sections passed in ValidateOptions.countries.
let extraBooleanKeys = new Set<string>();

const BOOLEAN_KEYS = new Set([
  "localisationReady",
  "optional",
  "lineeGuidaDesign",
  "modelloInteroperabilita",
  "misureMinimeSicurezza",
  "gdpr",
  "spid",
  "pagopa",
  "cie",
  "anpr",
  "io",
]);

// Mirror what the parser's Go YAML decoder does before validation:
// - `key:` with no value is null, decoded as the zero value (so `required`
//   fires instead of a type error): drop nulls in objects;
// - any scalar decodes into a string field (`phone: +39...` is valid):
//   numbers, and booleans outside the boolean keys, become strings.
function normalize(value: unknown, key?: string): unknown {
  if (typeof value === "number") return String(value);
  if (
    typeof value === "boolean" &&
    !(key && (BOOLEAN_KEYS.has(key) || extraBooleanKeys.has(key)))
  ) {
    return String(value);
  }
  if (Array.isArray(value)) return value.map((v) => normalize(v));
  if (!isObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => [k, normalize(v, k)]),
  );
}

// "/maintenance/contacts/0/name" -> "maintenance.contacts[0].name", the key
// format of the parser (and what react-hook-form's lodash.set understands).
// The parser only rewrites `description[en]` to `description.en` for purely
// alphabetic language tags, so `description[en-US].name` keeps the brackets.
function toKey(instancePath: string, data: unknown, extra?: string): string {
  const parts = instancePath
    .split("/")
    .slice(1)
    .map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));
  if (extra !== undefined) parts.push(extra);

  let key = "";
  let node: unknown = data;
  for (const part of parts) {
    if (Array.isArray(node)) {
      key += `[${part}]`;
      node = node[Number(part)];
    } else if (key === "description" && !/^[A-Za-z]+$/.test(part)) {
      key += `[${part}]`;
      node = isObject(node) ? node[part] : undefined;
    } else {
      key += key === "" ? part : `.${part}`;
      node = isObject(node) ? node[part] : undefined;
    }
  }

  return key;
}

const field = (key: string) => key.split(".").pop() ?? key;

// Sections that are plain structs in the parser: when missing, it reports
// their required keys instead of the section itself.
const STRUCT_SECTIONS: Record<string, string[]> = {
  legal: ["license"],
  maintenance: ["type"],
  localisation: ["localisationReady", "availableLanguages"],
};

const oneOf = (values: unknown[]) => {
  const s = values.map((v) => `"${v}"`);
  return s.length > 1
    ? `${s.slice(0, -1).join(", ")} or ${s[s.length - 1]}`
    : s.join("");
};

const FORMAT_MESSAGES: Record<string, string> = {
  url_url: "must be a valid URL",
  url_http_url: "must be an HTTP URL",
  email: "must be a valid email address",
  date: "must be a date with format 'YYYY-MM-DD'",
  mime_type: "is not a valid MIME type",
  spdx_expression: "must be a valid license (see https://spdx.org/licenses)",
  bcp47_strict_language_tag: "must be a valid BCP 47 language",
  iso3166_1_alpha2_lower_or_upper:
    "must be a valid ISO 3166-1 alpha-2 two-letter country code",
  italian_ipa_code:
    "must be a valid Italian Public Administration Code (iPA) (see https://github.com/publiccodeyml/italian-organizations-ipa-vocabulary)",
  organisation_uri: "is not a valid URI",
  supports_id:
    "must be a known alias ('alias:<name>') or a valid URI (URL or URN)",
};

// Messages modelled on the parser's go-playground translations.
function toIssues(e: ErrorObject, data: Data): Issue[] {
  if (e.keyword === "required" && e.instancePath === "") {
    const children = STRUCT_SECTIONS[e.params.missingProperty];
    if (children) {
      return children.map((child) => ({
        key: `${e.params.missingProperty}.${child}`,
        description: `${child} is a required field`,
      }));
    }
  }

  const issue = toIssue(e, data);

  return issue ? [issue] : [];
}

function toIssue(e: ErrorObject, data: Data): Issue | null {
  switch (e.keyword) {
    case "if":
      return null; // the then/else error is reported on its own
    case "required": {
      const key = toKey(e.instancePath, data, e.params.missingProperty);
      const when = e.schemaPath.includes("/then/")
        ? ` when "type" is "${(data.maintenance as Data | undefined)?.type}"`
        : "";
      return { key, description: `${field(key)} is a required field${when}` };
    }
    case "additionalProperties": {
      const key = toKey(e.instancePath, data, e.params.additionalProperty);
      return {
        key,
        description: `unknown field "${e.params.additionalProperty}"`,
      };
    }
    case "propertyNames": {
      const key = toKey(e.instancePath, data);
      return {
        key,
        description: `${field(key)} must be a valid BCP 47 language`,
      };
    }
    case "false schema": {
      const key = toKey(e.instancePath, data);
      return {
        key,
        description: `${field(key)} must not be present unless "type" is "contract"`,
      };
    }
  }

  if (e.schemaPath.includes("/propertyNames/")) return null;

  let key = toKey(e.instancePath, data);
  // A single isBasedOn URL is decoded into a one-element list.
  if (key === "isBasedOn" && typeof data.isBasedOn === "string") {
    key = "isBasedOn[0]";
  }
  const name = field(key);

  switch (e.keyword) {
    case "type":
      return { key, description: "wrong type for this field" };
    case "enum":
      return {
        key,
        description: `${name} must be one of the following: ${oneOf(e.params.allowedValues)}`,
      };
    case "format":
      if (
        e.params.format === "organisation_uri" &&
        String(e.data).startsWith("urn:x-italian-pa:")
      ) {
        return {
          key,
          description: `${name} must be a valid Italian Public Administration Code (iPA) with format 'urn:x-italian-pa:[codiceIPA]' (see https://github.com/publiccodeyml/italian-organizations-ipa-vocabulary)`,
        };
      }
      if (
        e.params.format === "supports_id" &&
        String(e.data).startsWith("alias:")
      ) {
        return {
          key,
          description: `${name} contains an unknown alias (see https://github.com/publiccodeyml/publiccode.yml/blob/main/docs/standard/aliases-list.rst)`,
        };
      }
      return {
        key,
        description: `${name} ${FORMAT_MESSAGES[e.params.format] ?? `must match format "${e.params.format}"`}`,
      };
    case "minLength":
      return e.schema === 1
        ? { key, description: `${name} is a required field` }
        : {
            key,
            description: `${name} must be at least ${e.schema} characters in length`,
          };
    case "maxLength":
      return {
        key,
        description: `${name} must be a maximum of ${e.schema} characters in length`,
      };
    case "minItems":
    case "minProperties":
      return {
        key,
        description: `${name} must contain more than ${Number(e.schema) - 1} items`,
      };
  }

  return { key, description: `${name} ${e.message ?? "is invalid"}` };
}

const toErr = ({ key, description }: Issue): Err => ({
  key,
  description,
  line: 0,
  column: 0,
});

// Same early exits as the parser: without a valid version nothing else is
// validated.
// Only that publiccodeYmlVersion is there and is a string (for 1.x).
function checkVersionType(data: unknown): { errors: Issue[]; warnings: Issue[] } {
  if (!isObject(data) || !("publiccodeYmlVersion" in data)) {
    return { errors: [{ key: "publiccodeYmlVersion", description: "publiccodeYmlVersion is a required field" }], warnings: [] };
  }
  if (typeof data.publiccodeYmlVersion !== "string") {
    return { errors: [{ key: "publiccodeYmlVersion", description: "wrong type for this field" }], warnings: [] };
  }
  return { errors: [], warnings: [] };
}

function checkVersion(data: unknown): { errors: Issue[]; warnings: Issue[] } {
  const required = {
    errors: [
      {
        key: "publiccodeYmlVersion",
        description: "publiccodeYmlVersion is a required field",
      },
    ],
    warnings: [],
  };

  if (!isObject(data) || !("publiccodeYmlVersion" in data)) return required;

  const version = data.publiccodeYmlVersion;
  if (typeof version !== "string") {
    return {
      errors: [
        {
          key: "publiccodeYmlVersion",
          description: "wrong type for this field",
        },
      ],
      warnings: [],
    };
  }
  if (!SUPPORTED_VERSIONS.includes(version)) {
    return {
      errors: [
        {
          key: "publiccodeYmlVersion",
          description: `unsupported version: '${version}'. Supported versions: ${SUPPORTED_VERSIONS.join(", ")}`,
        },
      ],
      warnings: [],
    };
  }
  if (version !== "0" && schemaVersionFor(version) !== LATEST_SUPPORTED) {
    return {
      errors: [],
      warnings: [
        {
          key: "publiccodeYmlVersion",
          description: `v${version} is not the latest version, use '0'. Parsing this file as v${LATEST}.`,
        },
      ],
    };
  }

  return { errors: [], warnings: [] };
}

export interface ValidateOptions {
  /** Extra country sections (e.g. experimental ones), added with withCountries(). */
  countries?: CountryExtension[];
  /** Keys of those sections whose values are YAML booleans and must not become strings. */
  booleanKeys?: string[];
}

/**
 * Validates a publiccode.yml (already parsed from YAML) with publiccode-schema-v0 and
 * the same extra checks as publiccode-parser-go, without network access.
 * Ported from publiccode-editor (src/app/validator/ajv).
 */
export function validate(input: unknown, options: ValidateOptions = {}): Result {
  extraBooleanKeys = new Set(options.booleanKeys ?? []);
  // On the raw input: the parser requires publiccodeYmlVersion to be a YAML
  // string, it's the one key where numbers aren't turned into strings.
  const version = checkVersion(input);
  const data = normalize(input);
  if (version.errors.length > 0 || !isObject(data)) {
    return {
      publicCode: null,
      errors: version.errors.map(toErr),
      warnings: [],
      version: null,
    };
  }

  const validateFn = validateSchema(options.countries);
  validateFn(data);

  const schemaErrors = (validateFn.errors ?? []).flatMap((e) =>
    toIssues(e, data),
  );
  const extra = checks(data);

  return {
    publicCode: data,
    errors: [...schemaErrors, ...extra.errors].map(toErr),
    warnings: [...version.warnings, ...extra.warnings].map(toErr),
    version: 0,
  };
}

// ---------------------------------------------------------------------------
// Validation against one version of the standard
// ---------------------------------------------------------------------------

// Loaded on demand (one chunk each), so that validate() alone doesn't ship them.
const VERSION_SCHEMAS: Record<SchemaVersion, () => Promise<{ default: object }>> = {
  "0.2.0": () => import("../../data/publiccode-schema/publiccode-schema-v0.2.0.json"),
  "0.3.0": () => import("../../data/publiccode-schema/publiccode-schema-v0.3.0.json"),
  "0.4.0": () => import("../../data/publiccode-schema/publiccode-schema-v0.4.0.json"),
  "0.5.0": () => import("../../data/publiccode-schema/publiccode-schema-v0.5.0.json"),
  "0.7.0": () => import("../../data/publiccode-schema/publiccode-schema-v0.7.0.json"),
  "0.8.0": () => import("../../data/publiccode-schema/publiccode-schema-v0.8.0.json"),
  "1.0.0": () => import("../../data/publiccode-schema/publiccode-schema-v1.0.0.json"),
};

// One Ajv for the per-version schemas, apart from the v0 one (which is
// recompiled when the country sections change).
let strictAjv: Ajv | undefined;
const strictFns = new Map<SchemaVersion, ReturnType<Ajv["compile"]>>();
async function versionSchema(version: SchemaVersion) {
  let fn = strictFns.get(version);
  if (!fn) {
    const schema = (await VERSION_SCHEMAS[version]()).default;
    // Another call may have compiled it while this one was loading
    fn = strictFns.get(version);
    if (!fn) {
      strictAjv ??= createAjv();
      fn = strictAjv.compile(schema);
      strictFns.set(version, fn);
    }
  }
  return fn;
}

export interface VersionValidateOptions extends ValidateOptions {
  /**
   * Version of the standard to check against (e.g. "0.4.0", or "0.4": the
   * schema of the closest older version is used). Default: the version the
   * file declares, or the latest the parser supports if it declares none.
   */
  version?: string;
  /**
   * false (default): the parser's rules, the ones that decide whether a file
   * is valid, plus the deprecations up to `version`.
   * true: the schema of that version only, stricter than the parser: keys the
   * version doesn't have are errors, and so are the keys it requires.
   * 1.x has no lenient rules: it's always strict.
   */
  strict?: boolean;
}

export interface VersionResult extends Result {
  /** No errors */
  valid: boolean;
  /** publiccodeYmlVersion as written in the file, null if missing or invalid */
  declaredVersion: string | null;
  /** The version of the standard the file was checked against */
  checkedVersion: SchemaVersion;
  /** "v0": the parser's schema, the same for every 0.x; otherwise the version's own */
  schema: "v0" | SchemaVersion;
  strict: boolean;
  /** What's deprecated in the file up to checkedVersion (fixable by upgrade()) */
  deprecations: Finding[];
}

/**
 * Validates a publiccode.yml (already parsed from YAML) against a version of
 * the standard, returning errors, warnings and deprecations: the "which version
 * does this file match, and how strictly" check of editors and dashboards.
 */
export async function validateVersion(
  input: unknown,
  options: VersionValidateOptions = {},
): Promise<VersionResult> {
  const raw = isObject(input) ? input.publiccodeYmlVersion : undefined;
  const declaredVersion = isVersion(raw) ? raw : null;
  const requested = options.version ?? declaredVersion ?? LATEST_SUPPORTED;
  if (!isVersion(requested)) throw new Error(`invalid version "${requested}"`);
  const checkedVersion = schemaVersionFor(requested);
  // 1.x (release candidate) has only its own schema: there's no lenient v1.
  const major1 = isAtLeast(checkedVersion, "1.0.0");
  const strict = major1 || (options.strict ?? false);
  const countries = [...standardCountries, ...(options.countries ?? [])];
  const found = deprecations(input, { countries, upTo: checkedVersion });

  if (!strict) {
    const r = validate(input, options);
    return {
      ...r,
      valid: r.errors.length === 0,
      declaredVersion,
      checkedVersion,
      schema: "v0",
      strict,
      deprecations: found,
    };
  }

  extraBooleanKeys = new Set(options.booleanKeys ?? []);
  // The 0.x version check rejects "1": against 1.x the schema's enum decides.
  const version = major1 ? checkVersionType(input) : checkVersion(input);
  const data = normalize(input);
  if (version.errors.length > 0 || !isObject(data)) {
    const errors = version.errors.map(toErr);
    return {
      publicCode: null,
      errors,
      warnings: [],
      version: null,
      valid: false,
      declaredVersion,
      checkedVersion,
      schema: checkedVersion,
      strict,
      deprecations: found,
    };
  }

  const fn = await versionSchema(checkedVersion);
  fn(data);
  const schemaErrors = (fn.errors ?? []).flatMap((e) => toIssues(e, data));
  const extra = checks(data);
  // Against 1.x the keys 0.x deprecated are gone: they're already errors
  // ("unknown field"), not deprecation warnings too.
  const errorKeys = new Set(schemaErrors.map((e) => e.key));
  const warnings = [...version.warnings, ...extra.warnings].filter((w) => !(major1 && errorKeys.has(w.key)));
  if (declaredVersion && schemaVersionFor(declaredVersion) !== checkedVersion) {
    warnings.unshift({
      key: "publiccodeYmlVersion",
      description: `the file declares version ${declaredVersion} (${normalizeVersion(declaredVersion)}) but was checked against ${checkedVersion}`,
    });
  }
  const errors = [...schemaErrors, ...extra.errors].map(toErr);

  return {
    publicCode: data,
    errors,
    warnings: warnings.map(toErr),
    version: 0,
    valid: errors.length === 0,
    declaredVersion,
    checkedVersion,
    schema: checkedVersion,
    strict,
    deprecations: found,
  };
}

export { SCHEMA_VERSIONS };
