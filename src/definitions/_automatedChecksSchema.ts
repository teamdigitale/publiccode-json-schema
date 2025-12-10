import S from "fluent-json-schema";

const maintenance_levels = [
	"Level 1: Active maintenance",
	"Level 2: Reliable maintenance",
	"Level 3: Crisis-proof maintenance",
];
const reuse_levels = [
	"Level 1: Ready for use",
	"Level 2: Actively Reused",
	"Level 3: Frequently Actively Reused",
];
const security_levels = [
	"Level 1: Basic Security Practices",
	"Level 2: Advanced Security Practices",
	"Level 3: Comprehensive Security Practices",
];

const accessibility_levels = ["WCAG 2.1 AA", "WCAG 2.2 AA"];

export default S.object()
	.id("#automatedChecks")
	.title("Automated checks on the repo")
	.additionalProperties(false)
	.prop(
		"is-open",
		S.boolean().description("Whether the software is open or not"),
	)
	.prop(
		"active-maintenance",
		S.string()
			.enum(maintenance_levels)
			.description("What is the maintenance level of this sw"),
	)
	.prop(
		"reuse",
		S.string()
			.enum(reuse_levels)
			.description("What is the reuse level of this sw"),
	)
	.prop(
		"security",
		S.string()
			.enum(security_levels)
			.description("What is the security level of this sw"),
	)
	.prop("itegrations", S.array().items(S.string()))
	.prop(
		"compliance",
		S.object()
			.additionalProperties(false)
			.description(
				"This section contains the keys for auto-declaring the compliance with the current legislation",
			)
			.prop("accessibility-level", S.string().enum(accessibility_levels))
			.prop("cookie-policy", S.boolean())
			.prop("gdpr", S.boolean()),
	);

export const fields = [
	{
		id: "automatedChecks_is-open",
		type: "checkbox",
		label: "Is Open Source?",
		group: "optional",
		defaultValue: true,
		helpText: "Software is open source",
	},
	{
		id: "automatedChecks_active-maintenance",
		type: "select",
		label: "Active Maintenance level",
		group: "optional",
		options: maintenance_levels.map((v) => ({ value: v, label: v })),
		helpText: "Active Maintenance level",
	},
	{
		id: "automatedChecks_reuse",
		type: "select",
		label: "Reuse level",
		group: "optional",
		options: reuse_levels.map((v) => ({ value: v, label: v })),
		helpText: "Reuse level",
	},
	{
		id: "automatedChecks_security",
		type: "select",
		label: "Security level",
		group: "optional",
		options: security_levels.map((v) => ({ value: v, label: v })),
		helpText: "Security level",
	},

	{
		id: "automatedChecks_itegrations",
		type: "array",
		label: "Detected Itegrations",
		group: "optional",
		arrayConfig: {
			itemFields: [
				{
					id: "name",
					type: "text",
					label: "Integration Name",
					placeholder: "Name of the detected integration",
					validation: {
						required: true,
						minLength: 2,
						maxLength: 100,
						customMessage: "Name is required",
					},
				},
			],
			minItems: 1,
			maxItems: 10,
			initialItems: 1,
			addButtonText: "Add Contact",
			removeButtonText: "Remove",
			itemTitle: "Contact {index}",
		},
		helpText: "Technical contacts responsible for maintaining the software",
	},

	{
		id: "automatedChecks_compliance_accessibility-level",
		type: "multiselect",
		label: "Accessibility levels",
		group: "optional",
		options: accessibility_levels.map((v) => ({ value: v, label: v })),
		validation: {
			minSelection: 1,
			customMessage: "Select at least one",
		},
		helpText: "Accessibility levels",
	},

	{
		id: "automatedChecks_compliance_gdpr",
		type: "checkbox",
		label: "Has gdpr compliance?",
		group: "optional",
		defaultValue: true,
		helpText: "",
	},
	{
		id: "automatedChecks_compliance_cookie-policy",
		type: "checkbox",
		label: "Has cookie-policy compliance?",
		group: "optional",
		defaultValue: true,
		helpText: "",
	},
];
