# publiccode-parser-go validation checklist

Every rule that [publiccode-parser-go](https://github.com/italia/publiccode-parser-go)
applies to a `publiccode.yml` **v0.x** file, and how it maps onto this JSON Schema.

- Source: parser `main` at `e122415` (v5.4.3 + 31 commits; the last ones only touch
  CI, docs, the CLI, the file name in diagnostics and the iPA code list).
  Note: commit `9fe860c` marks the parser repository as **unmaintained**.
- The editor (`publiccode-editor/src/wasm/go.mod`) pins **v5.4.3**, not v5.2.1.
  The *Since* column marks rules that appeared after v5.2.1, so both versions
  can be compared.
- The editor runs the parser with `DisableNetwork: true` (but external checks
  **enabled**): see [Network and file checks](#network-and-file-checks).
- v1 (`publiccodeYmlVersion: "1"`, still a skeleton upstream) is out of scope.

Legend for **Schema @ main** (the `publiccode-schema-v0.5.0.json` generated from `main`):
✅ covered · ⚠️ partially / wrongly covered · ❌ missing.

Legend for **How**:
- **JSON** – plain JSON Schema (draft-07).
- **format** – a custom Ajv format (implemented in the editor, see
  [Custom formats](#custom-formats)). Vocabularies are generated from the Go
  libraries by `scripts/vocab` into `data/vocab/`.
- **keyword** – Ajv re-implements a standard keyword with parser semantics.
- **TS** – needs code outside the schema (the editor's `checks` module).

## 1. Pre-checks (stop validation on failure)

These run before anything else; on failure the parser returns **only** this
error.

| Rule | Key | Level | Schema @ main | How | Since |
|---|---|---|---|---|---|
| Input must be valid UTF-8 | `""` | error | n/a | TS (YAML layer) | |
| YAML syntax errors | `""` | error | n/a | TS (YAML layer) | |
| Only one YAML document per file | `""` | error | n/a | TS (YAML layer) | |
| `publiccodeYmlVersion` present (also when the document is empty) | `publiccodeYmlVersion` | error | ✅ required | TS (pre-check, to stop early like the parser) | |
| `publiccodeYmlVersion` must be a YAML **string** (`0.2` unquoted → "wrong type for this field") | `publiccodeYmlVersion` | error | ✅ `type: string` | TS pre-check | |
| `publiccodeYmlVersion` in `SupportedVersions` (`0`, `0.2`, `0.2.0`, `0.2.1`, `0.2.2`, `0.3`, `0.3.0`, `0.4`, `0.4.0`, `0.5`, `0.5.0`, `0.7`, `0.7.0`) | `publiccodeYmlVersion` | error | ⚠️ enum lacks `0.7`, `0.7.0` | JSON enum + TS pre-check | `0.7*` in v5.4.0 |

## 2. Decoding (YAML → Go struct)

| Rule | Key | Level | Schema @ main | How | Since |
|---|---|---|---|---|---|
| Unknown keys are rejected (`DisallowUnknownField`), at every level | the unknown key | error | ⚠️ `additionalProperties:false` everywhere except `description.<lang>` (broken, see §4) | JSON | |
| Wrong YAML type for a field ("wrong type for this field") | first bad key | error | ⚠️ types present, some wrong | JSON `type` | |
| Decoding stops at the **first** decode error; the struct validator then runs on the partially-decoded struct | — | — | n/a | Not reproducible: Ajv reports all errors. Expect extra "required" errors from the parser on such files | |
| `isBasedOn` accepts a string **or** a list of strings | `isBasedOn` | — | ✅ (`oneOf`) | JSON `type: [string, array]` | |
| Both `IT` and `it` are accepted keys (same `ITSectionV0` struct) | `IT`, `it` | — | ❌ only `IT`; files with `it:` fail on the root `additionalProperties:false` | JSON (add `it`) | |

## 3. Struct `validate` tags — root

| Field | Tag(s) | Level | Schema @ main | How | Since |
|---|---|---|---|---|---|
| `publiccodeYmlVersion` | `required,oneof=…` | error | ⚠️ (see §1) | JSON | |
| `name` | `required` (non-empty string) | error | ⚠️ required but empty string allowed | JSON `minLength: 1` | |
| `url` | `required,url_url` | error | ⚠️ `format: uri` (different semantics) | format `url_url` | |
| `landingURL` | `url_http_url` | error | ⚠️ `format: uri` | format `url_http_url` | |
| `isBasedOn[*]` | `url_url` | error | ❌ | format `url_url` | |
| `releaseDate` | `date` (`datetime=2006-01-02`) | error | ✅ `format: date` | ajv-formats `date` | |
| `inputTypes[*]`, `outputTypes[*]` | `is_mime_type` | error | ❌ | format `mime_type` | |
| `platforms` | `gt=0` (≥ 1 item; missing counts as 0) | error | ⚠️ required but no `minItems`; has an enum the parser does **not** enforce | JSON `minItems: 1`, drop the enum | |
| `categories[*]` | `is_category_v0` | error | ✅ enum | JSON enum | |
| `fundedBy[*]` | `dive` → organisation rules | error | ⚠️ see organisation | JSON `$ref` | |
| `roadmap` | `url_http_url` | error | ⚠️ `format: uri` | format `url_http_url` | |
| `developmentStatus` | `required,oneof=concept development beta stable obsolete` | error | ✅ | JSON | |
| `softwareType` | `required,oneof=…` (9 values) | error | ✅ | JSON | |
| `supports[*].id` | `required,supports_id` | error | ❌ (`supports` missing → unknown key) | JSON + format `supports_id` | v5.4.0 |
| `intendedAudience.scope[*]` | `is_scope_v0` | error | ✅ enum | JSON enum | |
| `intendedAudience.countries[*]`, `unsupportedCountries[*]` | `iso3166_1_alpha2_lower_or_upper` | error | ⚠️ `^[A-Z]{2}$`: rejects lowercase (only a warning in the parser), accepts unassigned codes | format `iso3166_1_alpha2_lower_or_upper` | |
| `description` | `gt=0` (≥ 1 language; required) | error | ⚠️ required, no `minProperties` | JSON `minProperties: 1` | |
| `description` keys | `bcp47_keys` (each key `bcp47_strict_language_tag`) | error (key `description`) | ❌ | JSON `propertyNames` + format `bcp47_strict_language_tag` | strict since v5.3.0 (was `bcp47_language_tag`) |
| `legal.license` | `required,is_spdx_expression` | error | ⚠️ required, any string | format `spdx_expression` | |
| `maintenance.type` | `required,oneof=internal contract community none` | error | ✅ | JSON | |
| `maintenance.contractors` | `required_if=Type contract` | error | ❌ | JSON `if`/`then` | |
| `maintenance.contractors` | `excluded_unless=Type contract` | error | ❌ | JSON `if`/`else` with `contractors: false` | |
| `maintenance.contacts` | `required_if=Type community`, `required_if=Type internal` | error | ❌ | JSON `if`/`then` | |
| `localisation.localisationReady` | `required` (non-nil bool) | error | ✅ | JSON | |
| `localisation.availableLanguages` | `required,gt=0` | error | ⚠️ required, no `minItems` | JSON `minItems: 1` | |
| `localisation.availableLanguages[*]` | `bcp47_strict_language_tag` | error | ❌ | format `bcp47_strict_language_tag` | strict since v5.3.0 |
| `dependsOn.{open,proprietary,hardware}[*]` | `dive` → dependency rules | error | ✅ | JSON `$ref` | |
| `IT` / `it` | nested struct validated (see §5) | error | ⚠️ | JSON `$ref` | |

## 4. Struct `validate` tags — nested objects

| Field | Tag(s) | Level | Schema @ main | How | Since |
|---|---|---|---|---|---|
| `description.<lang>` (whole object) | — | — | ❌ **bug**: the builder defines a *property named* `additionalProperties`, so language entries are not validated at all and any key is accepted | JSON `additionalProperties: {$ref}` | |
| `description.<lang>.genericName` | `umax=35` (grapheme clusters) | error | ⚠️ `maxLength` counts code points | keyword `maxLength` = graphemes | |
| `description.<lang>.shortDescription` | `required,umax=150` | error | ⚠️ code points; empty allowed | JSON `minLength: 1` + keyword | |
| `description.<lang>.longDescription` | `required,umin=150,umax=10000` (graphemes) | error | ⚠️ not required, code points | JSON required + keyword | |
| `description.<lang>.documentation`, `apiDocumentation` | `url_http_url` | error | ⚠️ `format: uri` | format `url_http_url` | |
| `description.<lang>.features` | `gt=0,dive` | error | ⚠️ no `minItems` | JSON `minItems: 1` | |
| `description.<lang>.videos[*]` | `url_http_url` | error | ❌ | format `url_http_url` | |
| `maintenance.contractors[*].name` | `required` | error | ⚠️ empty allowed | JSON `minLength: 1` | |
| `maintenance.contractors[*].until` | `required,date` | error | ✅ | JSON + ajv-formats `date` | |
| `maintenance.contractors[*].email` | `email` | error | ❌ **bug**: `format: date` | format `email` (parser regex) | |
| `maintenance.contractors[*].website` | `url_http_url` | error | ⚠️ `format: uri` | format `url_http_url` | |
| `maintenance.contacts[*].name` | `required` | error | ⚠️ empty allowed | JSON `minLength: 1` | |
| `maintenance.contacts[*].email` | `email` | error | ⚠️ ajv-formats email, different regex | format `email` (parser regex) | |
| `dependsOn.*[*].name` | `required,gt=0` | error | ⚠️ empty allowed | JSON `minLength: 1` | |
| `dependsOn.*[*].version*` | `*string` | error (decode) | ⚠️ accepts numbers | JSON `type: string` (verify via parity) | |
| `organisation.uri`, `fundedBy[*].uri` | `required,organisation_uri` | error | ⚠️ optional, `format: uri` | JSON required + format `organisation_uri` | case-insensitive URN check since v5.3.1 |
| `supports[*].id` | `required,supports_id` | error | ❌ | format `supports_id` | v5.4.0 |

## 5. Country section (`IT` / `it`)

| Rule | Key | Level | Schema @ main | How | Since |
|---|---|---|---|---|---|
| `countryExtensionVersion` `oneof=0.2 1.0` | `IT.countryExtensionVersion` | error | ⚠️ any string | JSON enum | |
| `riuso.codiceIPA` `is_italian_ipa_code` | `IT.riuso.codiceIPA` | error | ❌ | format `italian_ipa_code` | |
| `conforme.*`, `piattaforme.*` booleans | | error (decode) | ✅ | JSON | |
| Both `IT` and `it` present: "'IT' key already present. Remove this key" | `it` | error | ❌ | TS | |
| `it` (lowercase) used: deprecated, use `IT` | `it` | **warning** | n/a | TS | |
| `IT.conforme` present: deprecated | `IT.conforme` | **warning** | n/a | TS | |
| `IT.riuso.codiceIPA` valid: deprecated, use `organisation.uri: urn:x-italian-pa:<code>` | `IT.riuso.codiceIPA` | **warning** | n/a | TS | |

## 6. Code checks in `validateFieldsV0` (fields.go)

| Rule | Key | Level | Network? | Schema @ main | How | Since |
|---|---|---|---|---|---|---|
| `publiccodeYmlVersion` is not `0` and not `0.7*`: "vX is not the latest version, use '0'. Parsing this file as v0.7." | `publiccodeYmlVersion` | **warning** | no | n/a | TS | before v5.4.0 the exemption was `0.5*` |
| `monochromeLogo` present: deprecated, use `logo` | `monochromeLogo` | **warning** | no | n/a | TS | |
| `legal.authorsFile` present: deprecated | `legal.authorsFile` | **warning** | no | n/a | TS | |
| `legal.repoOwner` present: deprecated, use `organisation.name` | `legal.repoOwner` | **warning** | no | n/a | TS | |
| `inputTypes` / `outputTypes` present: deprecated | `inputTypes`, `outputTypes` | **warning** | no | n/a | TS | |
| `description.<lang>.genericName` non-empty: deprecated | `description.<lang>.genericName` | **warning** | no | n/a | TS | |
| Lowercase (valid) country code: deprecated, use uppercase | `intendedAudience.countries[i]`, `…unsupportedCountries[i]` | **warning** | no | n/a | TS | |
| `logo`, `monochromeLogo`, `legal.authorsFile`, `screenshots[i]` must not be an absolute path (`/…`) or a `file:` URL | same key | error | no | ❌ | TS (could be a JSON `pattern`, kept in TS for the message) | |
| Relative `logo` / `monochromeLogo` must end in `.svg`, `.svgz` or `.png` | `logo` | error | no (external checks) | ❌ | TS | |
| Relative `screenshots[i]` must end in `.jpg` or `.png` | `description.<lang>.screenshots[i]` | error | no (external checks) | ❌ | TS | |
| `videos[i]` must match an oEmbed provider scheme | `description.<lang>.videos[i]` | error | no | ❌ | TS (`data/vocab/oembed-schemes.json`) | providers list shrunk in v5.3.0 |

## Network and file checks

Skipped by the editor (`DisableNetwork: true`), or no-ops in WASM
(`runtime.GOARCH == "wasm"` makes `isReachable` and `fileExists` return true):

| Rule | Key | Level | Skipped by |
|---|---|---|---|
| `url` reachable and is a code repository (`vcsurl.IsRepo`) | `url` | error | DisableNetwork |
| `landingURL`, `roadmap`, `documentation`, `apiDocumentation` reachable | same | error | DisableNetwork |
| Raw base URL derived from `url` (`vcsurl.GetRawRoot`) when no base URL is given | `url` | error | DisableNetwork |
| `logo` / `monochromeLogo` file exists; PNG decodes | `logo` | error | WASM no-op / no network for remote files |
| `legal.authorsFile` exists | `legal.authorsFile` | error | WASM no-op |
| `screenshots[i]` exist | `…screenshots[i]` | error | WASM no-op |
| Minimum PNG logo width | `logo` | error | removed in v5.3.1 |

These can't be done in the browser with JSON Schema anyway; a remote validator
(`VITE_VALIDATOR_REMOTE_URL`) is the place for them.

## Custom formats

| Format | Parser tag | Semantics | Vocabulary |
|---|---|---|---|
| `url_url` | `url_url` → go-playground `url` | lowercased `net/url.Parse`: needs a scheme; `file:` needs a path other than `/`; other schemes need a host, opaque part or fragment | — |
| `url_http_url` | `url_http_url` → `http_url` | `url_url` + non-empty host + scheme `http`/`https` | — |
| `email` | `email` | go-playground's e-mail regex | `email-regex.json` |
| `date` | `date` | `YYYY-MM-DD`, real calendar date | ajv-formats |
| `mime_type` | `is_mime_type` | `^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$` | — |
| `spdx_expression` | `is_spdx_expression` | go-spdx `ValidateLicenses`: active or deprecated IDs (case-insensitive), `+`, `WITH` exceptions, `AND`/`OR`, parentheses, `LicenseRef-`/`DocumentRef-` | `spdx.json` (go-spdx v2.7.0) |
| `bcp47_strict_language_tag` | `bcp47_strict_language_tag` | RFC 5646 grammar + known language (x/text), extlang prefixes, script, region (ISO 3166 / M.49 subset), registered variants | `bcp47.json` (x/text v0.37.0, validator v10.30.3) |
| `iso3166_1_alpha2_lower_or_upper` | same | all-lower or all-upper, assigned ISO 3166-1 alpha-2 code | `countries.json` |
| `italian_ipa_code` | `is_italian_ipa_code` | case-insensitive membership | `ipa-codes.json` (parser v5.4.3) |
| `organisation_uri` | `organisation_uri` | `ParseRequestURI`; URN → RFC 2141 and, for `urn:x-italian-pa:`, a known iPA code; otherwise scheme + host | `ipa-codes.json` |
| `supports_id` | `supports_id` | `alias:<gdpr\|eidas\|nis2\|cra\|spid\|cie\|anpr\|pagopa\|io>`, or a URN (RFC 2141), or a URI with scheme + host | — |

`maxLength`/`minLength` stay standard keywords in the schema (so other tools
still get a sensible limit), but the editor's Ajv instance redefines them to
count **grapheme clusters** like the parser's `umax`/`umin` (`uniseg`).

## Error vs warning summary

- **Errors**: everything in §1–§5 except the deprecations, plus the path,
  extension and oEmbed checks in §6.
- **Warnings** (never block the editor): the version-not-latest message,
  `monochromeLogo`, `legal.authorsFile`, `legal.repoOwner`, `inputTypes`,
  `outputTypes`, `genericName`, lowercase country codes, lowercase `it`,
  `IT.conforme`, `IT.riuso.codiceIPA`.

## Changes after v5.2.1 (relevant to validation)

| Version | Change |
|---|---|
| v5.2.2 | `url` on GitHub accepts trailing slashes (network check) |
| v5.3.0 | `bcp47_language_tag` → `bcp47_strict_language_tag` for `availableLanguages` and `description` keys; oEmbed providers replaced by a scheme list; v1 skeleton |
| v5.3.1 | case-insensitive `urn:` / `x-italian-pa:` in `organisation_uri`; minimum PNG logo width check removed |
| v5.4.0 | `publiccodeYmlVersion` `0.7`/`0.7.0`; `supports[*].id` (`supports_id`); the "not latest version" warning now exempts `0.7*` instead of `0.5*` |
| after v5.4.3 | only the iPA code list (`data/it/ipa_codes.txt`) and the file name in diagnostics |
