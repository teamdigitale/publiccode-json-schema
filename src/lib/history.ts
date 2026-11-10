// How the core keys changed across versions of the standard, from its
// CHANGELOG.rst. Paths are dotted YAML paths; `*` matches any key of a map
// (description languages). Arrays are transparent: "categories" is the list.
//
// The generator applies these to the v0 schema to build one strict schema per
// version (src/lib/schema.ts); the editor uses them to decide which fields to
// show (src/lib/form.ts).

export interface FieldHistory {
	path: string;
	// First version that has the key.
	since?: string;
	// The key is mandatory in versions older than this one.
	requiredBefore?: string;
	deprecated?: { since: string; hint: string };
	// First version without the key (1.0.0 removes what 0.x deprecated).
	removed?: string;
}

export interface ValueHistory {
	// Path to a string or an array of strings with an enum.
	path: string;
	value: string;
	since?: string;
	deprecated?: { since: string; hint: string };
	// First version without the value.
	removed?: string;
}

// The standard's 1.0-rc branch removes the keys and values deprecated up to 0.7.
export const V1 = "1.0.0";

export const fieldHistory: FieldHistory[] = [
	{ path: "supports", since: "0.7.0" },
	{ path: "organisation", since: "0.5.0" },
	{ path: "fundedBy", since: "0.5.0" },
	{ path: "categories", requiredBefore: "0.5.0" },
	{ path: "releaseDate", requiredBefore: "0.4.0" },
	{
		path: "description.*.genericName",
		requiredBefore: "0.3.0",
		deprecated: { since: "0.3.0", hint: "It's safe to drop it." },
		removed: V1,
	},
	{
		path: "monochromeLogo",
		deprecated: { since: "0.3.0", hint: "Use 'logo' instead." },
		removed: V1,
	},
	{
		path: "inputTypes",
		deprecated: { since: "0.3.0", hint: "It's safe to drop it." },
		removed: V1,
	},
	{
		path: "outputTypes",
		deprecated: { since: "0.3.0", hint: "It's safe to drop it." },
		removed: V1,
	},
	{
		path: "legal.authorsFile",
		deprecated: { since: "0.4.0", hint: "It's safe to drop it." },
		removed: V1,
	},
	{
		path: "legal.repoOwner",
		deprecated: { since: "0.5.0", hint: "Use 'organisation.name' instead." },
		removed: V1,
	},
	{
		path: "usedBy",
		deprecated: { since: "0.8.0", hint: "It will be removed." },
	},
	{
		path: "description.*.videos",
		deprecated: {
			since: "0.8.0",
			hint: "Link videos from the documentation or the website of the software instead.",
		},
	},
	{
		path: "intendedAudience.unsupportedCountries",
		deprecated: {
			since: "0.8.0",
			hint: "Use 'intendedAudience.countries' to list the countries the software explicitly targets instead.",
		},
	},
	{
		path: "dependsOn.open",
		deprecated: {
			since: "0.8.0",
			hint: "Open source runtime dependencies are already declared in the SBOM or in the package manager manifests.",
		},
	},
];

export const valueHistory: ValueHistory[] = [
	{ path: "categories", value: "whistleblowing", since: "0.3.0" },
	{ path: "categories", value: "educational-content", since: "0.3.0" },
	{ path: "categories", value: "regulations-and-directives", since: "0.4.0" },
	{ path: "categories", value: "integrated-library-system", since: "0.4.0" },
	{ path: "categories", value: "design", since: "0.4.0" },
	{ path: "categories", value: "design-system", since: "0.4.0" },
	{ path: "categories", value: "other", since: "0.5.0" },
	{
		path: "intendedAudience.scope",
		value: "government",
		deprecated: { since: "0.8.0", hint: "It will be removed." },
		removed: V1,
	},
];

// Before 0.5.0 country codes (sections and ISO 3166-1 alpha-2 values) were
// lowercase; since then they're uppercase and lowercase is deprecated.
export const UPPERCASE_COUNTRIES_SINCE = "0.5.0";
// Since 1.0.0 lowercase country codes are no longer accepted, and
// maintenance.contacts[].phone MUST be E.164 (+ and up to 15 digits).
export const UPPERCASE_ONLY_SINCE = V1;
export const E164_SINCE = V1;
export const E164 = "^\\+[1-9][0-9]{1,14}$";
