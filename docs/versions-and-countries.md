# Versions, deprecations and country packages

## What gets generated (`bun run gen`)

| File | What it's for |
|---|---|
| `data/publiccode-schema/publiccode-schema-v0.json` | Validation. Every 0.x version with the same rules, like publiccode-parser-go; deprecated keys are annotated (`deprecated: true`) but accepted. This is the one the editor's Ajv validator uses. |
| `data/publiccode-schema/publiccode-schema-v<X.Y.Z>.json` | Reference for one version (0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.7.0, 0.8.0): only the keys and values that exist in it, its mandatory keys, its deprecations. **Stricter than the parser**: e.g. 0.4.0 rejects `organisation` and requires `categories`. Useful for editors and IDEs, not for deciding if a file is valid. |
| `data/form-schema/form-schema-v<X.Y.Z>.json` | The fields to show for a version, derived from that schema plus `src/form/ui.ts`. |
| `data/countries/<CODE>.json` | Country packages as data. |

0.6.0 changed nothing in the standard, so it has no schema; a declared version
maps to the schema of the closest older version (`schemaVersionFor()`:
"0.2.1" → 0.2.0, "0" → 0.7.0).

0.8.0 exists in the standard but the parser stops at 0.7: the editor keeps
validating with v0, and the 0.8.0 changes are reported as deprecations.

## Where the version rules come from

`src/lib/history.ts`, from the standard's `CHANGELOG.rst`:

- when a key appeared (`supports` 0.7.0, `organisation` and `fundedBy` 0.5.0);
- until when it was mandatory (`categories` before 0.5.0, `releaseDate`
  before 0.4.0, `genericName` before 0.3.0);
- when it was deprecated, and what to use instead;
- values added to or deprecated in the vocabularies (categories, the
  `government` scope);
- lowercase country codes and sections before 0.5.0.

Country packages add their own (`IT.piattaforme.io` in 0.3.0, the whole `IT`
section deprecated in 0.7.0).

## Form schemas

A form schema has only **keys**, no text. Each field has:

- `path` (arrays are transparent, `*` is the language of `description`),
- `i18n` (`publiccodeyml.<path>`; the editor already has `.label` and
  `.description` for all of them),
- `group` and `order`, `widget`, `required`/`requiredWhen`, `constraints`,
  `options`/`suggestions`, `since`, `deprecated`, `country`.

Types, constraints and mandatory keys come from the schema; `src/form/ui.ts`
only adds where and how to show a field. A test checks that every label key
exists in publiccode-editor's `en.json` or in a country package.

New text that isn't about a field (deprecation messages) lives in the
library (in English, with the parser's wording where the parser has the same
warning); country packages ship their own translations (`countryLocales()`).

## Deprecations and upgrades

```ts
import { deprecations, upgrade, standardCountries } from "publicode-schema";

const countries = standardCountries();
deprecations(data, { countries });
// [{ id: "codiceIPA", key: "IT.riuso.codiceIPA", since: "0.5.0", parser: true,
//    fixable: true, lossy: false, message: "This key is DEPRECATED ..." }, ...]

const { data: upgraded, applied, remaining } = upgrade(data, { countries });
```

- `deprecations()` reports everything up to 0.8.0 (`upTo` to stop earlier);
  `since` tells the version, `parser` whether the parser warns about it too
  (to avoid showing it twice).
- `upgrade()` applies the fixes up to `to` (default 0.7.0, the latest the
  parser accepts) and sets `publiccodeYmlVersion`. It never changes its input.
  Fixes that drop information the standard doesn't call safe to drop
  (`usedBy`, `videos`, the `government` scope, `unsupportedCountries`,
  `dependsOn.open`) need `lossy: true`. What it can't do alone (e.g.
  `repoOwner` without an `organisation.uri`) stays in `remaining`.

The migrations follow the standard's text: `it` → `IT`; lowercase country codes
→ uppercase; `IT.riuso.codiceIPA` → `organisation.uri: urn:x-italian-pa:<code>`
(with `repoOwner` as its name, like the parser); `legal.repoOwner` →
`organisation.name`; `IT.piattaforme.<x>: true` → `supports: [{id: alias:<x>}]`;
`IT.conforme.gdpr: true` → `alias:gdpr`; `monochromeLogo` → `logo` when there's
no logo; the single string `isBasedOn` → a one element list (0.8.0). The `IT`
section goes away once nothing but `countryExtensionVersion` is left in it.

## Country packages

See [src/countries/README.md](../src/countries/README.md).
