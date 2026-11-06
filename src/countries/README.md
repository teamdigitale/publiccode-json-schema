# Country packages

A country package is everything country-specific in one folder: the standards
and platforms of the country as `supports` choices, its translations, and
optionally a section of its own (like `IT:`). The editor shows its fields from
the generated form schema; nothing in the editor is written per country.

## Before adding a section: use `supports`

Since publiccode.yml 0.7.0 country sections are **deprecated** (they go away
in 1.0) in favour of the generic `supports` key, and `IT` is the only one the
standard defines. publiccode-parser-go rejects any other section as an
unknown key, so a file with `NL:` fails the parser, the catalog and the
editor's default WASM validator.

So the recommended package has no section, only `supports` presets:

```ts
supports: [{ id: "https://www.digid.nl/", label: "DigiD" }],
```

An `alias:<name>` id must be in the standard's list of aliases (an unknown
alias is a validation error): propose new ones to
[publiccode.yml](https://github.com/publiccodeyml/publiccode.yml)
(`docs/standard/aliases-list.rst`) and use the URI until they're in.
`defineCountry()` refuses unknown aliases.

A section is still possible, with `status: "experimental"`: it isn't in the
generated schemas, and consumers add it explicitly with `withCountries()`.
Only use it where files don't need to pass the parser.

## Adding a country

1. Create `src/countries/<CODE>/index.ts` (uppercase ISO 3166-1 alpha-2
   code) exporting a `CountryExtension` (see `types.ts`; `IT/` is the
   complete example):
   - `status`: `"standard"` only for sections the standard defines;
   - `supports`: presets, as above;
   - `section` (optional): the JSON Schema of the section, plain JSON, without
     `$id`; `deprecated` and `lowercaseKey` as needed;
   - `fieldHistory`: when keys of the section were added or deprecated (paths
     start with the code: `NL.example`);
   - `deprecations`: rules that find a deprecated key in a file and, where
     possible, migrate it (`fix`); see `IT/index.ts`;
   - `ui`: order and widgets of the section fields (see `src/lib/form.ts`);
   - `locales`: translations by language, at least `en`. Keys are
     `publiccodeyml.<code lowercase>.<path>.label|description` for the fields
     and `countries.<CODE>.name` for the section title.
2. Add it to `countries` in `src/countries/index.ts`.
3. Run `bun run gen` and `bun test`.

`bun run gen` writes `data/countries/<CODE>.json` (the package as data) and,
for standard packages, puts the section in every generated schema and form
schema.
