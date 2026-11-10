# Changelog

All notable changes to this project will be documented in this file.

## 0.2.0 (2026-11-10)

### Changed

* **publiccode.yml 0.8 is supported**: `publiccodeYmlVersion` "0.8" and "0.8.0" are valid,
  WebP and AVIF images are accepted for the logo and the screenshots of 0.8 (and "0")
  files, and `LATEST_SUPPORTED` is 0.8.0, so "0" maps to 0.8.0 and `upgrade()` goes to
  0.8.0 by default. publiccode-parser-go still stops at 0.7: `PARSER_LATEST` (0.7.0) and
  `isSupportedByParser()` say what it accepts, and `ACCEPTED_VERSIONS` lists what this
  library accepts. The v0 schema also annotates the 0.8.0 deprecations

### Added

* `validateVersion()` in `publiccode-schema/validator`: validates a file against a version
  of the standard, with the parser's rules or (`strict: true`) with that version's schema
  only, and returns errors, warnings and the deprecations up to that version. The
  per-version schemas are loaded on demand, one chunk each, so `validate()` alone is no
  bigger
* `vocabulary()`, `valueLabel()` and `VOCABULARY_FIELDS`: values and labels (English and
  Italian) of `categories`, `intendedAudience.scope`, `developmentStatus`, `softwareType`
  and `platforms`, with the version that added or deprecated a value. The Italian labels
  come from the Developers Italia catalogue, plus the five categories it was missing
  (`design`, `design-system`, `integrated-library-system`, `regulations-and-directives`,
  `other`); `local-authorities` is "Enti locali"
* The CI smoke test also runs `validateVersion()` and `vocabulary()` from the packed
  package

## 0.1.0 (2026-11-09)

First release as an npm package.

### Added

* `publiccode-schema/validator`: `validate()`, the custom Ajv formats and the parser's
  extra checks, moved here from publiccode-editor (`src/app/validator/ajv`) so that the
  editor and other tools share one copy
* npm packaging: ESM bundles and type declarations in `dist/` (`bun run build`), works
  with `moduleResolution` `bundler`, `node16` and `nodenext`; `exports` for `.`,
  `./validator` and `./data/*`
* CI (typecheck, tests, build, smoke test of the packed package with Node) and a release
  workflow that publishes to npm from a `v*` tag

### Changed

* **Breaking**: the package is named `publiccode-schema` (double c) and the schema `$id`s
  are `publiccode/root/v…` instead of `publicode/root/v…`
* License: AGPL-3.0-or-later, like publiccode-editor
* `fluent-json-schema` and `yaml` are development dependencies: the published library
  only needs `ajv` and `ajv-formats`

## 2026-11-06

### Added

* `docs/validation-checklist.md`: every publiccode-parser-go v0 rule, with its level
  (error or warning), whether the schema covers it, how JSON Schema can express it, and
  what changed after parser v5.2.1
* vocabularies generated from the Go modules the editor's WASM uses
  (`bun run vocab`): BCP 47 subtags, ISO 3166-1 alpha-2 and alpha-3 country codes, SPDX
  licenses and exceptions, iPA codes, oEmbed schemes, the parser's email regex
* a Go oracle (`scripts/vocab/oracle`) that runs the parser's own validators, to test the
  custom formats against them
* one schema per version of the standard (0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.7.0, 0.8.0),
  built from its changelog: when keys appeared, until when they were mandatory, when
  they were deprecated and what replaces them; next to `publiccode-schema-v0.json`, which
  validates every 0.x version like the parser and is the one validators should use
* form schemas, one per version, derived from the schema plus a small UI overlay
  (`src/form/ui.ts`): they only carry translation keys, following publiccode-editor's
  `publiccodeyml.<path>` convention, and replace the hand-written form fields
* a TypeScript library with no fluent-json-schema dependency (`src/index.ts`):
  * versions: `schemaVersionFor()`, `LATEST_SUPPORTED` (0.7.0), `LATEST_KNOWN` (0.8.0)
  * `deprecations(data)`: what's deprecated in a file, with the version that deprecated
    it and whether the parser reports it too
  * `upgrade(data, { to })`: migrates a file as the standard says (`it` → `IT`,
    lowercase country codes, `IT.riuso.codiceIPA` → `organisation.uri`,
    `legal.repoOwner` → `organisation.name`, `IT.piattaforme.*` and `IT.conforme.gdpr`
    → `supports` aliases, `monochromeLogo` → `logo`...), without changing its input;
    fixes that drop information need `lossy: true`
  * `buildSchema()`, `buildFormSchema()`, `withCountries()`, `sectionsFormSchema()`,
    `countryLocales()`
* country packages (`src/countries/`), identified by ISO 3166-1 alpha-3 ids (`ita`):
  `supports` presets, translations, version history, deprecation rules and sections.
  The `ita` package holds the standard's `IT` section, with its translations in five
  languages. Experimental sections (a package's own, keyed by its id, e.g. `nld:`) are
  left out of the generated schemas, since the parser rejects them, and enabled by
  consumers. See `src/countries/README.md`.
* translations of the deprecation messages in en, it, de, fr and nl (`src/locales`, and
  `countries.<id>.deprecations` in the country packages): `locales(lang)` and
  `deprecationKeys(finding)`
* `docs/versions-and-countries.md`, and tests (`bun test`)

### Fixed

* the schema now matches publiccode-parser-go v0:
  * `description` validated nothing: its language keys are BCP 47 tags and their values
    are checked
  * `contractor.email` was validated as a date
  * `platforms` no longer has a closed list of values
  * lowercase `countries` are accepted (the parser only warns)
  * `organisation.uri` is mandatory
  * `supports`, version 0.7, the lowercase `it` section and `features` as mandatory were
    missing
  * custom formats for URLs, emails, MIME types, SPDX expressions, BCP 47 tags, country
    codes, iPA codes, organisation URIs and `supports` ids
  * the `maintenance` conditions on `contractors` and `contacts`
  * dependency versions are strings, as the Go decoder reads any scalar as one
* the description of `IT.conforme.gdpr` (copied from `misureMinimeSicurezza`)
* `tsc` errors in `isBasedOn` and the license list; the library compiles for ES2020

### Changed

* **breaking**: country packages have an `id` and `sections` instead of `code` and
  `section`; `countries` and `countryById()` replace `standardCountries()` and
  `countryByCode()`
* `bun run gen` writes `publiccode-schema-v0.json`, the versioned schemas and form
  schemas, and `data/countries/<id>.json`; `src/form-schema.ts` and the `formFields`
  of the definitions are gone
