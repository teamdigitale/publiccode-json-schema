import { supportsAliases } from "../lib/vocab";
import type { FormGroup, FormOption, UiOverlay } from "../lib/form";

// The sections of publiccode-editor, in its order; ids are its
// editor.sections.<id> translation keys.
export const groups: FormGroup[] = [
	["version", "publiccodeyml.publiccodeYmlVersion.label"],
	["name", "editor.sections.name"],
	["description-and-features", "editor.sections.description-and-features"],
	["repository-and-documentation", "editor.sections.repository-and-documentation"],
	["software-details", "editor.sections.software-details"],
	["logo-and-screenshots", "editor.sections.logo-and-screenshots"],
	["supports", "editor.sections.supports"],
	["organisation", "editor.sections.organisation"],
	["dependsOn", "publiccodeyml.dependsOn.label"],
	["localisation", "editor.sections.localisation"],
	["purpose-and-audience", "editor.sections.purpose-and-audience"],
	["legal-and-reuse", "editor.sections.legal-and-reuse"],
	["maintenance", "editor.sections.maintenance"],
].map(([id, i18n], i) => ({ id, i18n, order: i + 1 }));

// Root keys get a group and an order; nested keys inherit the group.
export const ui: UiOverlay = {
	publiccodeYmlVersion: { group: "version", order: 1, widget: "hidden" },

	name: { group: "name", order: 1 },
	applicationSuite: { group: "name", order: 2 },

	description: { group: "description-and-features", order: 1 },
	"description.*.genericName": { order: 1 },
	"description.*.localisedName": { order: 2 },
	"description.*.shortDescription": { order: 3 },
	"description.*.documentation": { order: 4 },
	"description.*.apiDocumentation": { order: 5 },
	"description.*.features": { order: 6 },
	"description.*.screenshots": { order: 7 },
	"description.*.videos": { order: 8 },
	"description.*.awards": { order: 9 },
	"description.*.longDescription": { order: 10, widget: "markdown" },

	url: { group: "repository-and-documentation", order: 1 },
	landingURL: { group: "repository-and-documentation", order: 2 },
	isBasedOn: { group: "repository-and-documentation", order: 3, widget: "tags" },
	fundedBy: { group: "repository-and-documentation", order: 4 },
	roadmap: { group: "repository-and-documentation", order: 5 },

	softwareVersion: { group: "software-details", order: 1 },
	releaseDate: { group: "software-details", order: 2 },
	developmentStatus: { group: "software-details", order: 3, widget: "radio" },
	categories: { group: "software-details", order: 4 },
	platforms: { group: "software-details", order: 5 },
	usedBy: { group: "software-details", order: 6 },
	softwareType: { group: "software-details", order: 7, widget: "radio" },

	inputTypes: { group: "logo-and-screenshots", order: 1 },
	outputTypes: { group: "logo-and-screenshots", order: 2 },
	monochromeLogo: { group: "logo-and-screenshots", order: 3 },
	logo: { group: "logo-and-screenshots", order: 4 },

	supports: { group: "supports", order: 1 },
	"supports.id": { widget: "supports" },

	organisation: { group: "organisation", order: 1 },
	"organisation.uri": { order: 1 },
	"organisation.name": { order: 2 },

	dependsOn: { group: "dependsOn", order: 1 },
	// The editor shares one set of keys for the three kinds of dependency.
	...Object.fromEntries(
		["open", "proprietary", "hardware"].flatMap((kind) =>
			["name", "versionMin", "versionMax", "version", "optional"].map((k) => [
				`dependsOn.${kind}.${k}`,
				{ i18n: `publiccodeyml.dependsOn.${k}` },
			]),
		),
	),

	localisation: { group: "localisation", order: 1 },

	intendedAudience: { group: "purpose-and-audience", order: 1 },
	"intendedAudience.scope": { order: 1 },
	"intendedAudience.countries": { order: 2 },
	"intendedAudience.unsupportedCountries": { order: 3 },

	legal: { group: "legal-and-reuse", order: 1 },
	"legal.license": { order: 1 },
	"legal.mainCopyrightOwner": { order: 2 },
	"legal.repoOwner": { order: 3 },
	"legal.authorsFile": { order: 4 },

	maintenance: { group: "maintenance", order: 1 },
	"maintenance.type": { order: 1, widget: "radio" },
	"maintenance.contractors": {
		order: 2,
		// The schema validates the items in its if/then on maintenance.type.
		items: "#contractor",
		requiredWhen: { "maintenance.type": ["contract"] },
	},
	"maintenance.contacts": {
		order: 3,
		requiredWhen: { "maintenance.type": ["community", "internal"] },
	},
};

// The aliases in the standard that aren't tied to a country; country presets
// (e.g. SPID for Italy) come from src/countries.
const EU_ALIASES = ["gdpr", "eidas", "nis2", "cra"];

export const supports: FormOption[] = supportsAliases
	.filter((a) => EU_ALIASES.includes(a))
	.map((a) => ({
		value: `alias:${a}`,
		label: a === "eidas" ? "eIDAS" : a.toUpperCase(),
	}));
