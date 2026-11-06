# Country packages

A country package is everything country-specific in one folder: the standards
and platforms of the country as `supports` choices, its translations, and
optionally sections of its own. The editor shows its fields from the form
schemas; nothing in the editor is written per country.

A package is identified by its ISO 3166-1 alpha-3 code, lowercase (`ita`,
`nld`, `deu`): it never collides with the alpha-2 section keys of the standard
(`IT:`, or the deprecated `it:`).

## Sections

A package can declare sections (`sections`), each with its key in
`publiccode.yml`:

- **Standard** (`standard: true`): defined by the publiccode.yml standard and
  accepted by the parser. Only `IT` exists, in the `ita` package, deprecated
  since 0.7.0 in favour of `supports` and `organisation` (it goes away in 1.0).
- **Experimental** (`standard: false`): a section of the package's own, whose
  key is the package id (`nld:`). publiccode-parser-go rejects it as an unknown
  key, so a file that has one fails the parser, the catalog and the editor's
  WASM validator. It's left out of the generated schemas: a consumer enables
  it explicitly (`withCountries()`, `buildSchema({ experimental })`,
  `sectionsFormSchema()`); publiccode-editor only with its Ajv validator.

Where `supports` is enough, prefer it: files stay valid everywhere.

```ts
supports: [{ id: "https://www.digid.nl/", label: "DigiD" }],
```

An `alias:<name>` id must be in the standard's list of aliases (an unknown
alias is a validation error): propose new ones to
[publiccode.yml](https://github.com/publiccodeyml/publiccode.yml)
(`docs/standard/aliases-list.rst`) and use the URI until they're in.

## Adding a country

1. Create `src/countries/<id>/index.ts` exporting a `CountryExtension` (see
   `types.ts`; `ita/` is the complete example):
   - `id`: the lowercase alpha-3 code;
   - `supports`: presets, as above;
   - `sections` (optional): `{ key: "<id>", standard: false, schema }`, the
     schema being plain JSON Schema without `$id`;
   - `fieldHistory`: when keys of its sections were added or deprecated
     (paths start with the section key: `nld.example`);
   - `deprecations`: rules that find a deprecated key in a file and, where
     possible, migrate it (`fix`); see `ita/index.ts`;
   - `ui`: order and widgets of the section fields (see `src/lib/form.ts`);
   - `locales`: translations by language, at least `en`. Keys:
     `countries.<id>.name` for the section title,
     `publiccodeyml.<section key, lowercase>.<path>.label|description` for the
     fields.
2. Add it to `countries` in `src/countries/index.ts`.
3. Run `bun run gen` and `bun test`.

`defineCountry()` checks the id, that an experimental section uses the id as
its key, that only the standard's sections are `standard`, the aliases and
the history paths.

`bun run gen` writes `data/countries/<id>.json` (the package as data) and puts
the standard sections in every generated schema and form schema.
