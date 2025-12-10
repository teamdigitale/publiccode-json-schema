import {
	categories,
	kinds,
	languages,
	platforms,
	scopes,
	statuses,
	versions,
} from "../constants";
import { fields as automatedChecksFields } from "../definitions/_automatedChecksSchema";

const groups = [
	{
		title: "Basic Information",
		description: "Essential information about your software",
	},
	{
		title: "Classification",
		description: "Categorize your software",
	},
	{
		title: "Description",
		description: "Detailed description of your software",
	},
	{
		title: "Legal Information",
		description: "License and copyright information",
	},
	{
		title: "Maintenance",
		description: "Maintenance and contact information",
	},
	{
		title: "Localisation",
		description: "Language and localisation settings",
	},
	{
		title: "Audience",
		description: "Target audience and scope",
	},
	{
		title: "Optional",
		description: "Sample group for optional and custom props",
	},
].map((group, index) => ({
	...group,
	id: group.title.toLowerCase().split(" ")[0],
	order: index + 1,
}));
console.log(JSON.stringify(groups, null, 2));

const fields = [
	// Basic Information Group
	{
		id: "publiccodeYmlVersion",
		type: "select",
		label: "PublicCode.yml Version",
		group: "basic",
		options: versions.map((v, index) => ({
			value: v,
			label: v,
			selected: index === 0,
		})),
		validation: {
			required: true,
		},
		helpText: "Version of the publiccode.yml standard",
	},
	{
		id: "name",
		type: "text",
		label: "Software Name",
		group: "basic",
		placeholder: "Enter the public name of your software",
		validation: {
			required: true,
			minLength: 2,
			maxLength: 100,
			customMessage:
				"Software name is required and must be between 2-100 characters",
		},
		helpText: "The public name most people refer to your software",
	},
	{
		id: "applicationSuite",
		type: "text",
		label: "Application Suite",
		group: "basic",
		placeholder: "e.g., Office Suite, Developer Tools",
		validation: {
			maxLength: 100,
		},
		helpText: "Optional: The suite to which this software belongs",
	},
	{
		id: "url",
		type: "text",
		label: "Repository URL",
		group: "basic",
		placeholder: "https://github.com/organization/repository",
		validation: {
			required: true,
			url: true,
			customMessage: "Please enter a valid repository URL",
		},
		helpText: "URL to the source code repository (git, svn, etc.)",
	},
	{
		id: "landingURL",
		type: "text",
		label: "Landing Page URL",
		group: "basic",
		placeholder: "https://example.com/software",
		validation: {
			url: true,
		},
		helpText: "Optional: User-friendly landing page for your software",
	},
	{
		id: "softwareVersion",
		type: "text",
		label: "Software Version",
		group: "basic",
		placeholder: "1.0.0",
		validation: {
			maxLength: 50,
		},
		helpText: "Latest stable version number",
	},
	{
		id: "releaseDate",
		type: "date",
		label: "Release Date",
		group: "basic",
		validation: {
			maxDate: new Date().toISOString().split("T")[0],
			customMessage: "Release date cannot be in the future",
		},
		helpText: "Date of the latest release",
	},

	// Classification Group
	{
		id: "platforms",
		type: "multiselect",
		label: "Platforms",
		group: "classification",
		options: platforms.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			minSelection: 1,
			customMessage: "Select at least one platform",
		},
		helpText: "Platforms where users can access your software",
	},
	{
		id: "categories",
		type: "multiselect",
		label: "Categories",
		group: "classification",
		options: categories.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			minSelection: 1,
			customMessage: "Select at least one category",
		},
		helpText: "Categories that describe your software",
	},
	{
		id: "developmentStatus",
		type: "select",
		label: "Development Status",
		group: "classification",
		options: statuses.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			required: true,
		},
		helpText: "Current development status of the software",
	},
	{
		id: "softwareType",
		type: "select",
		label: "Software Type",
		group: "classification",
		options: kinds.map((v) => ({
			value: v,
			label: v,
		})),
		validation: {
			required: true,
		},
		helpText: "Type of software",
	},

	// Description Group
	{
		id: "description_locale",
		type: "select",
		label: "Description Language",
		group: "description",
		options: languages,
		validation: {
			required: true,
		},
		helpText: "Primary language for the description",
	},
	{
		id: "description_shortDescription",
		type: "text",
		label: "Short Description",
		group: "description",
		placeholder: "A concise one-line description",
		validation: {
			required: true,
			maxLength: 150,
			customMessage: "Short description is required (max 150 characters)",
		},
		helpText: "Single sentence describing your software (max 150 chars)",
	},
	{
		id: "description_longDescription",
		type: "textarea",
		label: "Long Description",
		group: "description",
		placeholder:
			"Detailed description of your software, its capabilities and features...",
		validation: {
			required: true,
			minLength: 150,
			maxLength: 10000,
			customMessage: "Long description must be between 150-10000 characters",
		},
		helpText: "Detailed overview of software capabilities (150-10000 chars)",
		attributes: {
			rows: 10,
		},
	},
	{
		id: "description_features",
		type: "textarea",
		label: "Features",
		group: "description",
		placeholder:
			"Enter features, one per line\nFeature 1\nFeature 2\nFeature 3",
		validation: {
			maxLength: 2000,
		},
		helpText: "List key features (one per line, max 100 chars each)",
		attributes: {
			rows: 6,
		},
	},
	{
		id: "description_documentation",
		type: "text",
		label: "Documentation URL",
		group: "description",
		placeholder: "https://docs.example.com",
		validation: {
			url: true,
		},
		helpText: "URL to user-level documentation",
	},

	// Legal Group
	{
		id: "legal_license",
		type: "text",
		label: "License",
		group: "legal",
		placeholder: "MIT, GPL-3.0-or-later, Apache-2.0",
		validation: {
			required: true,
			minLength: 2,
			maxLength: 100,
			customMessage: "License is required (use SPDX expression)",
		},
		helpText: "SPDX license expression (required)",
	},
	{
		id: "legal_mainCopyrightOwner",
		type: "text",
		label: "Main Copyright Owner",
		group: "legal",
		placeholder: "Organization Name or Individual",
		validation: {
			maxLength: 200,
		},
		helpText: "Entity that owns copyright on most of the code",
	},
	{
		id: "legal_repoOwner",
		type: "text",
		label: "Repository Owner",
		group: "legal",
		placeholder: "Organization or Individual",
		validation: {
			maxLength: 200,
		},
		helpText: "Entity that owns this repository",
	},

	// Maintenance Group
	{
		id: "maintenance_type",
		type: "select",
		label: "Maintenance Type",
		group: "maintenance",
		options: [
			{ value: "internal", label: "Internal" },
			{ value: "contract", label: "Contract" },
			{ value: "community", label: "Community", selected: true },
			{ value: "none", label: "None" },
		],
		validation: {
			required: true,
		},
		helpText: "How the software is currently maintained",
	},
	{
		id: "maintenance_contacts",
		type: "array",
		label: "Maintenance Contacts",
		group: "maintenance",
		arrayConfig: {
			itemFields: [
				{
					id: "name",
					type: "text",
					label: "Contact Name",
					placeholder: "Full name of technical contact",
					validation: {
						required: true,
						minLength: 2,
						maxLength: 100,
						customMessage: "Contact name is required",
					},
				},
				{
					id: "email",
					type: "text",
					label: "Email",
					placeholder: "contact@example.com",
					validation: {
						email: true,
					},
				},
				{
					id: "phone",
					type: "text",
					label: "Phone",
					placeholder: "+1 555-123-4567",
					attributes: { type: "tel" },
				},
				{
					id: "affiliation",
					type: "text",
					label: "Affiliation",
					placeholder: "Company or Organization",
					validation: {
						maxLength: 100,
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

	// Localisation Group
	{
		id: "localisation_localisationReady",
		type: "checkbox",
		label: "Localisation Ready",
		group: "localisation",
		defaultValue: true,
		helpText: "Software has infrastructure for multilingual support",
	},
	{
		id: "localisation_availableLanguages",
		type: "multiselect",
		label: "Available Languages",
		group: "localisation",
		options: languages,
		validation: {
			minSelection: 1,
			customMessage: "Select at least one available language",
		},
		helpText: "Languages in which the software is available",
	},

	// Intended Audience Group
	{
		id: "intendedAudience_countries",
		type: "array",
		label: "Target Countries",
		group: "audience",
		arrayConfig: {
			itemFields: [
				{
					id: "country",
					type: "text",
					label: "Country Code",
					placeholder: "US, IT, DE, FR, etc.",
					validation: {
						required: true,
						pattern: "^[A-Z]{2}$",
						minLength: 2,
						maxLength: 2,
						customMessage:
							"Enter a valid ISO 3166-1 alpha-2 country code (e.g., US, IT)",
					},
				},
			],
			minItems: 0,
			maxItems: 50,
			initialItems: 0,
			addButtonText: "Add Country",
			removeButtonText: "Remove",
			itemTitle: "Country {index}",
		},
		helpText:
			"Countries for which the software claims specific compliance (ISO 3166-1 alpha-2)",
	},
	{
		id: "intendedAudience_scope",
		type: "multiselect",
		label: "Application Scope",
		group: "audience",
		options: scopes.map((v) => ({ value: v, label: v })),
		validation: {
			minSelection: 0,
		},
		helpText: "Fields of application for the software",
	},
	...automatedChecksFields,
];
const data = {
	title: "PublicCode.yml Generator",
	description:
		"Generate a valid publiccode.yml file for your open source software project",
	groups,
	fields,
};

export default data;
