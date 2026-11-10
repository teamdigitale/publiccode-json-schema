// Vocabularies the runtime library needs, kept apart from src/constants.ts
// so that importing the library doesn't pull in the license list.

// Values publiccode-parser-go accepts for publiccodeYmlVersion (it stops at 0.7).
export const parserVersions = [
	"0",
	"0.2",
	"0.2.0",
	"0.2.1",
	"0.2.2",
	"0.3",
	"0.3.0",
	"0.4",
	"0.4.0",
	"0.5",
	"0.5.0",
	"0.7",
	"0.7.0",
];

// Values this library accepts: the parser's plus the versions of the standard
// the parser doesn't support yet. All 0.x versions share the v0 rules.
export const versions = [...parserVersions, "0.8", "0.8.0"];

// Aliases accepted by `supports[].id` (publiccode-parser-go supports_id).
export const supportsAliases = [
	"gdpr",
	"eidas",
	"nis2",
	"cra",
	"spid",
	"cie",
	"anpr",
	"pagopa",
	"io",
];
