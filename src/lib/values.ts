// Labels of the values of the standard's closed vocabularies (categories,
// scopes, development statuses, software types, platforms), with the version
// that added a value and the one that deprecated it. For catalogues, editors
// and search filters, so that nobody copies the labels by hand.
//
// The values are the keys of `values.<field>` in src/locales/en.json; a test
// checks they match the vocabularies the schemas are built from.
import de from "../locales/de.json";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import it from "../locales/it.json";
import nl from "../locales/nl.json";
import { valueHistory } from "./history";
import { compareVersions } from "./versions";

export const VOCABULARY_FIELDS = {
	categories: "categories",
	"intendedAudience.scope": "scope",
	developmentStatus: "developmentStatus",
	softwareType: "softwareType",
	platforms: "platforms",
} as const;

/** A publiccode.yml key with a closed list of values. */
export type VocabularyField = keyof typeof VOCABULARY_FIELDS;

export interface VocabularyValue {
	value: string;
	label: string;
	/** First version of the standard that has the value */
	since?: string;
	deprecated?: { since: string; hint: string };
}

type Labels = Record<string, Record<string, string>>;
const LABELS: Record<string, Labels | undefined> = {
	en: en.values,
	it: it.values,
	de: (de as { values?: Labels }).values,
	fr: (fr as { values?: Labels }).values,
	nl: (nl as { values?: Labels }).values,
};

const baseLang = (lang: string) => lang.toLowerCase().split("-")[0] ?? "en";

/** The label of a value in a language, falling back to English, then to the value. */
export function valueLabel(field: VocabularyField, value: string, lang = "en"): string {
	const ns = VOCABULARY_FIELDS[field];
	return LABELS[baseLang(lang)]?.[ns]?.[value] ?? en.values[ns][value as never] ?? value;
}

/**
 * The values of a vocabulary with their labels, in the standard's order.
 * With `version`, only the values that exist in that version of the standard.
 */
export function vocabulary(
	field: VocabularyField,
	options: { lang?: string; version?: string } = {},
): VocabularyValue[] {
	const ns = VOCABULARY_FIELDS[field];
	const history = valueHistory.filter((h) => h.path === field);
	return Object.keys(en.values[ns])
		.map((value) => {
			const h = history.find((x) => x.value === value);
			return {
				value,
				label: valueLabel(field, value, options.lang),
				...(h?.since && { since: h.since }),
				...(h?.deprecated && { deprecated: h.deprecated }),
			};
		})
		.filter((v) => !options.version || !v.since || compareVersions(options.version, v.since) >= 0);
}
