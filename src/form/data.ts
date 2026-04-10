import { fields as automatedChecksFields } from "../definitions/_automatedChecksSchema";
import { formFields as applicationSuiteFields } from "../definitions/applicationSuite";
import { formFields as categoriesFields } from "../definitions/categories";
import { formFields as descriptionFields } from "../definitions/descriptionSchema";
import { formFields as developmentStatusFields } from "../definitions/developmentStatus";
import { formFields as intendedAudienceFields } from "../definitions/intendedAudienceSchema";
import { formFields as landingURLFields } from "../definitions/landingURL";
import { formFields as legalFields } from "../definitions/legalSchema";
import { formFields as localisationFields } from "../definitions/localisationSchema";
import { formFields as maintenanceFields } from "../definitions/maintenanceSchema";
import { formFields as nameFields } from "../definitions/name";
import { formFields as platformsFields } from "../definitions/platforms";
import { formFields as publiccodeYmlVersionFields } from "../definitions/publiccodeYmlVersion";
import { formFields as releaseDateFields } from "../definitions/releaseDate";
import { formFields as softwareTypeFields } from "../definitions/softwareType";
import { formFields as softwareVersionFields } from "../definitions/softwareVersion";
import { formFields as urlFields } from "../definitions/url";

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
	...publiccodeYmlVersionFields,
	...nameFields,
	...applicationSuiteFields,
	...urlFields,
	...landingURLFields,
	...softwareVersionFields,
	...releaseDateFields,

	// Classification Group
	...platformsFields,
	...categoriesFields,
	...developmentStatusFields,
	...softwareTypeFields,

	// Description Group
	...descriptionFields,

	// Legal Group
	...legalFields,

	// Maintenance Group
	...maintenanceFields,

	// Localisation Group
	...localisationFields,

	// Intended Audience Group
	...intendedAudienceFields,

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
