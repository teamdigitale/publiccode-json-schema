import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import v0 from "../data/publiccode-schema/publiccode-schema-v0.json";
import { groups, supports, ui } from "../src/form/ui";
import {
	buildFormSchema,
	buildSchema,
	type CountryExtension,
	countryLocales,
	defineCountry,
	deprecations,
	type FormField,
	type FormSchema,
	normalizeVersion,
	SCHEMA_VERSIONS,
	schemaVersionFor,
	countries,
	sectionsFormSchema,
	upgrade,
	withCountries,
} from "../src/index";
import { baseSchema } from "../src/publiccode-schema";

// Structure only: the custom formats are tested in publiccode-editor.
const FORMATS = [
	"url_url",
	"url_http_url",
	"mime_type",
	"spdx_expression",
	"bcp47_strict_language_tag",
	"iso3166_1_alpha2_lower_or_upper",
	"italian_ipa_code",
	"organisation_uri",
	"supports_id",
];

function validator(schema: object) {
	const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
	addFormats(ajv, ["date", "email"]);
	for (const f of FORMATS) ajv.addFormat(f, true);
	const validate = ajv.compile(schema);

	return (data: unknown) => {
		validate(data);
		return (validate.errors ?? []).map((e) => `${e.instancePath} ${e.keyword}`.trim());
	};
}

const minimal = (version = "0.7.0") => ({
	publiccodeYmlVersion: version,
	name: "Medusa",
	url: "https://github.com/italia/developers.italia.it.git",
	platforms: ["web"],
	categories: ["cloud-management"],
	releaseDate: "2017-04-15",
	developmentStatus: "development",
	softwareType: "standalone/other",
	description: {
		en: {
			shortDescription: "A short description",
			longDescription: "Very long description of this software. ".repeat(5),
			features: ["Feature 1"],
		},
	},
	legal: { license: "AGPL-3.0-or-later" },
	maintenance: { type: "community", contacts: [{ name: "Francesco Rossi" }] },
	localisation: { localisationReady: true, availableLanguages: ["en"] },
});

const strict = (version: (typeof SCHEMA_VERSIONS)[number]) =>
	validator(buildSchema(baseSchema, { version, countries }));

describe("versions", () => {
	it("maps declared versions to schemas", () => {
		expect(normalizeVersion("0.5")).toBe("0.5.0");
		expect(schemaVersionFor("0.2.1")).toBe("0.2.0");
		expect(schemaVersionFor("0.6.0")).toBe("0.5.0");
		expect(schemaVersionFor("0")).toBe("0.7.0");
		expect(schemaVersionFor("0.8")).toBe("0.8.0");
	});
});

describe("schemas", () => {
	it("generates the v0 schema the validators use", () => {
		expect(buildSchema(baseSchema, { countries })).toEqual(v0);
	});

	it("accepts every 0.x version in v0, like the parser", () => {
		const validate = validator(v0);
		const old = { ...minimal("0.4"), organisation: { uri: "urn:x-italian-pa:pcm" } };
		expect(validate(old)).toEqual([]);
		expect(validate({ ...minimal(), it: { riuso: { codiceIPA: "pcm" } } })).toEqual([]);
	});

	it("applies the rules of each version in the strict schemas", () => {
		const { categories: _, ...noCategories } = minimal("0.4");
		expect(strict("0.4.0")(noCategories)).toEqual(["required"]);
		expect(strict("0.5.0")({ ...noCategories, publiccodeYmlVersion: "0.5" })).toEqual([]);

		const org = { ...minimal("0.4.0"), organisation: { uri: "urn:x-italian-pa:pcm" } };
		expect(strict("0.4.0")(org)).toEqual(["additionalProperties"]);

		// Before 0.5.0 the country section and codes were lowercase only.
		const v02 = minimal("0.2.0");
		// genericName was mandatory until 0.3.0.
		Object.assign(v02.description.en, { genericName: "Medusa" });
		expect(strict("0.3.0")(minimal("0.3.0"))).toEqual([]);
		expect(strict("0.2.0")({ ...v02, it: { piattaforme: { spid: true } } })).toEqual([]);
		expect(strict("0.2.0")({ ...v02, IT: {} })).toEqual(["additionalProperties"]);
		expect(strict("0.2.0")({ ...v02, intendedAudience: { countries: ["IT"] } })).toEqual([
			"/intendedAudience/countries/0 pattern",
		]);
		// piattaforme.io arrived in 0.3.0.
		expect(strict("0.2.0")({ ...v02, it: { piattaforme: { io: true } } })).toEqual([
			"/it/piattaforme additionalProperties",
		]);
	});

	it("only accepts its own versions in a strict schema", () => {
		expect(strict("0.7.0")(minimal("0.5"))).toEqual(["/publiccodeYmlVersion enum"]);
		expect(strict("0.8.0")(minimal("0.8.0"))).toEqual([]);
	});
});

describe("deprecations", () => {
	const old = {
		...minimal("0.4"),
		monochromeLogo: "img/mono.svg",
		inputTypes: ["text/plain"],
		isBasedOn: "https://example.org/original.git",
		legal: { license: "MIT", repoOwner: "Comune di Roma" },
		intendedAudience: { countries: ["it"], scope: ["government", "culture"] },
		usedBy: ["Comune di Roma"],
		it: {
			countryExtensionVersion: "0.2",
			conforme: { gdpr: true, lineeGuidaDesign: true },
			piattaforme: { spid: true, cie: false },
			riuso: { codiceIPA: "c_h501" },
		},
	};

	it("finds them, with the version that deprecated each", () => {
		const found = deprecations(old, { countries });
		expect(found.map((f) => `${f.since} ${f.id} ${f.key}`)).toEqual([
			"0.5.0 lowercaseSection it",
			"0.3.0 monochromeLogo monochromeLogo",
			"0.3.0 inputTypes inputTypes",
			"0.5.0 lowercaseCountries intendedAudience.countries[0]",
			"0.5.0 repoOwner legal.repoOwner",
			"0.8.0 isBasedOnString isBasedOn",
			"0.8.0 usedBy usedBy",
			"0.8.0 governmentScope intendedAudience.scope[0]",
			"0.5.0 codiceIPA IT.riuso.codiceIPA",
			"0.5.0 conforme IT.conforme",
			"0.7.0 piattaforme IT.piattaforme.spid",
			"0.7.0 piattaforme IT.piattaforme.cie",
			"0.7.0 countrySection it",
		]);
		expect(found.find((f) => f.id === "lowercaseCountries")?.message).toBe(
			"Lowercase country codes are DEPRECATED. Use uppercase instead ('IT')",
		);
		expect(deprecations(old, { countries, upTo: "0.7.0" }).some((f) => f.since === "0.8.0")).toBe(
			false,
		);
	});

	it("upgrades a file to the latest supported version", () => {
		const { data, applied, remaining } = upgrade(old, { countries });

		expect(data).toEqual({
			...minimal("0.7.0"),
			logo: "img/mono.svg",
			isBasedOn: "https://example.org/original.git",
			legal: { license: "MIT" },
			intendedAudience: { countries: ["IT"], scope: ["government", "culture"] },
			usedBy: ["Comune di Roma"],
			organisation: { uri: "urn:x-italian-pa:c_h501", name: "Comune di Roma" },
			supports: [{ id: "alias:gdpr" }, { id: "alias:spid" }],
		});
		expect(applied.map((f) => f.id)).toContain("countrySection");
		// 0.8.0 ones aren't applied to a 0.7.0 target.
		expect(remaining.map((f) => f.id)).toEqual([]);
		expect(validator(v0)(data)).toEqual([]);
		expect(strict("0.7.0")(data)).toEqual([]);
		expect(old.it.riuso.codiceIPA).toBe("c_h501");
	});

	it("only drops information when asked to", () => {
		const to08 = upgrade(old, { countries, to: "0.8.0" });
		expect(to08.data.isBasedOn).toEqual(["https://example.org/original.git"]);
		expect(to08.remaining.map((f) => f.id)).toEqual(["usedBy", "governmentScope"]);
		expect(to08.remaining.every((f) => f.lossy)).toBe(true);

		const lossy = upgrade(old, { countries, to: "0.8.0", lossy: true });
		expect(lossy.remaining).toEqual([]);
		expect(lossy.data.usedBy).toBeUndefined();
		expect(lossy.data.intendedAudience).toEqual({ countries: ["IT"], scope: ["culture"] });
	});

	it("leaves to the user what it can't migrate", () => {
		const { remaining } = upgrade(
			{ ...minimal("0.5"), legal: { license: "MIT", repoOwner: "Acme" } },
			{ countries },
		);
		// organisation needs a uri, which repoOwner doesn't give.
		expect(remaining.map((f) => f.id)).toEqual(["repoOwner"]);
	});
});

// A package with a section of its own: experimental, since the parser
// rejects any section but IT.
const nld: CountryExtension = {
	id: "nld",
	sections: [
		{
			key: "nld",
			standard: false,
			schema: {
				additionalProperties: false,
				properties: {
					countryExtensionVersion: { type: "string", enum: ["0.1"] },
					example: { type: "boolean" },
				},
			},
		},
	],
	supports: [{ id: "https://www.digid.nl/", label: "DigiD" }],
	ui: { "nld.example": { order: 1 } },
	locales: {
		en: {
			publiccodeyml: { nld: { example: { label: "Example" } } },
			countries: { nld: { name: "Netherlands" } },
		},
	},
};

describe("country packages", () => {
	it("checks a package", () => {
		expect(defineCountry(nld)).toBe(nld);
		expect(() => defineCountry({ ...nld, id: "nl" })).toThrow(/alpha-3/);
		expect(() => defineCountry({ ...nld, id: "xxx" })).toThrow(/alpha-3/);
		expect(() =>
			defineCountry({ ...nld, supports: [{ id: "alias:digid", label: "DigiD" }] }),
		).toThrow(/list of aliases/);
		// An experimental section uses the package id, never an alpha-2 code.
		const section = nld.sections?.[0];
		expect(() =>
			defineCountry({ ...nld, sections: [{ ...section!, key: "NL" }] }),
		).toThrow(/must use the key "nld"/);
		expect(() =>
			defineCountry({ ...nld, sections: [{ ...section!, key: "NL", standard: true }] }),
		).toThrow(/isn't a section of the standard/);
	});

	it("adds an experimental section only on request", () => {
		const file = { ...minimal(), nld: { countryExtensionVersion: "0.1", example: true } };
		expect(validator(v0)(file)).toEqual(["additionalProperties"]);
		expect(validator(buildSchema(baseSchema, { countries: [...countries, nld] }))(file)).toEqual([
			"additionalProperties",
		]);
		expect(validator(withCountries(v0, [nld]))(file)).toEqual([]);
		expect(
			validator(buildSchema(baseSchema, { countries: [...countries, nld], experimental: ["nld"] }))(
				file,
			),
		).toEqual([]);
	});

	it("puts its fields and presets in the form schema", () => {
		const all = [...countries, nld];
		const schema = buildSchema(baseSchema, { version: "0.7.0", countries: all, experimental: ["nld"] });
		const form = buildFormSchema(schema, {
			version: "0.7.0",
			ui,
			groups,
			supports,
			countries: all,
			experimental: ["nld"],
		});

		expect(form.groups.at(-1)).toMatchObject({
			id: "section:nld",
			i18n: "countries.nld.name",
			country: "nld",
			key: "nld",
			experimental: true,
		});
		expect(form.fields.find((f) => f.path === "nld.example")).toMatchObject({
			i18n: "publiccodeyml.nld.example",
			widget: "boolean",
			group: "section:nld",
			country: "nld",
			experimental: true,
		});
		const presets = form.fields.find((f) => f.path === "supports.id")?.suggestions;
		expect(presets?.at(-1)).toEqual({ value: "https://www.digid.nl/", label: "DigiD", country: "nld" });
	});

	it("builds the form of a package's sections alone", () => {
		const form = sectionsFormSchema(nld, "0.7.0");
		expect(form.groups).toEqual([
			expect.objectContaining({ id: "section:nld", key: "nld", experimental: true }),
		]);
		expect(form.fields.map((f) => f.path)).toEqual([
			"nld",
			"nld.example",
			"nld.countryExtensionVersion",
		]);
	});

	it("merges the translations with an English fallback", () => {
		const bundle = countryLocales("fr", [nld, ...countries]) as Record<string, any>;
		expect(bundle.countries.nld.name).toBe("Netherlands");
		expect(bundle.countries.ita.name).toBe("Italie");
		expect(bundle.publiccodeyml.it.riuso.label).toBe("Réutilisation");
	});
});

describe("form schemas", () => {
	const form = (v: string): FormSchema =>
		JSON.parse(readFileSync(`data/form-schema/form-schema-v${v}.json`, "utf8"));

	it("shows the fields of each version", () => {
		const paths = (v: string) => form(v).fields.map((f) => f.path);
		expect(paths("0.4.0")).not.toContain("organisation");
		expect(paths("0.5.0")).toContain("organisation.uri");
		expect(paths("0.5.0")).not.toContain("supports");
		expect(paths("0.7.0")).toContain("supports.id");
		expect(form("0.2.0").groups.at(-1)).toMatchObject({ id: "section:IT", key: "it" });
		expect(form("0.7.0").groups.at(-1)).toMatchObject({
			id: "section:IT",
			country: "ita",
			key: "IT",
		});
	});

	it("marks what's deprecated in that version", () => {
		const deprecated = (v: string) =>
			form(v).fields.filter((f) => f.deprecated).map((f) => f.path);
		expect(deprecated("0.2.0")).toEqual([]);
		expect(deprecated("0.4.0")).toContain("legal.authorsFile");
		expect(deprecated("0.4.0")).not.toContain("legal.repoOwner");
		expect(deprecated("0.7.0")).toContain("IT.piattaforme.spid");
		expect(deprecated("0.7.0")).not.toContain("usedBy");
		expect(deprecated("0.8.0")).toContain("usedBy");
	});

	// The form schema only has keys: the translations are publiccode-editor's
	// (core fields) and the country packages' own.
	const editorLocale = "../publiccode-editor/src/i18n/locales/en.json";
	it.skipIf(!existsSync(editorLocale))("has a translation for every label", () => {
		const editor = JSON.parse(readFileSync(editorLocale, "utf8"));
		const locales = [editor, countryLocales("en", countries)];
		const has = (key: string) =>
			locales.some((l) => key.split(".").reduce((o, k) => o?.[k], l) !== undefined);

		const f = form("0.7.0");
		// A root section (legal, IT...) is titled by its group.
		const titled = (x: FormField) =>
			x.parent === undefined && (x.widget === "fieldset" || x.widget === "localised");
		const missing = [
			...f.groups.map((g) => g.i18n),
			...f.fields
				.filter((x) => x.widget !== "hidden" && !titled(x))
				.map((x) => `${x.i18n}.label`),
		].filter((k) => !has(k));
		expect(missing).toEqual([]);
	});
});
