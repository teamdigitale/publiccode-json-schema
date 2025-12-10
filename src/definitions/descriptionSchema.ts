import S from "fluent-json-schema";

export default S.object()
	.id("#description")
	.description(
		"This section contains a general description of the software. Parsers can use this section for instance to create a web page describing the software.,\n\nNote: since all the strings contained in this section are user-visible and written in a specific language, you must specify the language you are editing the text in (using the IETF BCP 47 specifications) by creating a sub-section with that name. The primary language subtag cannot be omitted, as mandated by the BCP 47.",
	)
	.prop(
		"additionalProperties",
		S.object()
			.additionalProperties(false)
			.required(["shortDescription"])
			.prop(
				"localisedName",
				S.string().description(
					'This key is an opportunity to localise the name in a specific language. It contains the (short) public name of the product. It should be the name most people usually refer to the software. In case the software has both an internal "code" name and a commercial name, use the commercial name.',
				),
			)
			.prop(
				"genericName",
				S.string()
					.maxLength(35)
					.description(
						'This key is the "Generic name", which refers to the specific category to which the software belongs. You can usually find the generic name in the presentation of the software, when you write: "Software xxx is a yyy". Notable examples include "Text Editor", "Word Processor", "Web Browser", "Chat" and so on… The generic name can be up to 35 characters long.',
					),
			)
			.prop(
				"shortDescription",
				S.string()
					.maxLength(150)
					.description(
						"This key contains a short description of the software. It should be a single line containing a single sentence. Maximum 150 characters are allowed.",
					),
			)
			.prop(
				"longDescription",
				S.string()
					.minLength(150)
					.maxLength(10000)
					.description(
						"This key contains a longer description of the software, between 500 and 10000 chars. It is meant to provide an overview of the capabilities of the software for a potential user. The audience for this text should be that of users of the software, not developers. You can think of this text as the description of the software that would be in its website (if the software had one).\n\nThis description can contain some basic markdown: *italic*, **bold**, bullet points and [links](#).",
					),
			)
			.prop(
				"documentation",
				S.string()
					.format("uri")
					.description(
						"This key contains a reference to the user-level (not developer-level) documentation of the software. The value must be a URL to a hosted version of the documentation.\n\nIt is suggested that the URL points to a hosted version of the documentation that is immediately readable through a common web browser in both desktop and mobile format. The documentation should be rendered in HTML and browsable like a website (with a navigation index, a search bar, etc.).\n\nIf the documentation is instead available only as a document, put a direct view/download link as URL in this key. You should commit the document as part of the source code repository, and then link to it using the code hosting source browser URL (e.g.: GitHub URL to the file). Prefer using open formats like PDF or ODT for maximum interoperability.\n\nWhichever the format for the documentation, remember to make its source files available under an open license, possibly by committing them as part of the repository itself.",
					),
			)
			.prop(
				"apiDocumentation",
				S.string()
					.format("uri")
					.description(
						"This key contains a reference to the API documentation of the software. The value must be a URL to a hosted version of the documentation.\n\nIt is suggested that the URL points to a hosted version of the documentation that is immediately readable through a common web browser. The documentation should be rendered in HTML and browsable like a website (with a navigation index, a search bar, etc.), and if there is a reference or test deployment, possibly offer an interactive interface (e.g. Swagger).\n\nIf the documentation is instead available only as a document, put a direct view/download link as URL in this key. You should commit the document as part of the source code repository, and then link to it using the code hosting source browser URL (e.g.: GitHub URL to the file). Prefer using open formats like PDF or ODT for maximum interoperability.\n\nWhichever the format for the documentation, remember to make its source files available under an open license, possibly by committing them as part of the repository itself.",
					),
			)
			.prop(
				"features",
				S.array()
					.items(S.string())
					.description(
						"This key contains a list of software features, describing what capabilities the software allows to do. The audience for this text should be that of public decision makers who will be commissioning the software. The features should thus not target developers; instead of listing technical features referring to implementation details, prefer listing user-visible functionalities of the software.\n\nWhile the key is mandatory, there is no mandatory minimum or maximum number of features that should be listed in this key. Each feature must use a maximum of 100 characters.\n\nThe suggested number of features to list is between 5 and 20, depending on the software size and complexity. There is no need for exhaustiveness, as users can always read the documentation for additional information.",
					),
			)
			.prop(
				"screenshots",
				S.array()
					.items(S.string())
					.description(
						"This key contains one or multiple paths to files showing screenshots of the software. They are meant to give a quick idea on how the software looks like and how it works. The key value can be the relative path to the file starting from the root of the repository, or it can be an absolute URL pointing to the screenshot in raw version. In both cases, the file must reside inside the same repository where the publiccode.yml file is stored.",
					),
			)
			.prop(
				"videos",
				S.array()
					.items(S.string())
					.description(
						"This key contains one or multiple URLs of videos showing how the software works. Like screenshots, videos should be used to give a quick overview on how the software looks like and how it works. Videos must be hosted on a video sharing website that supports the oEmbed standard; popular options are YouTube and Vimeo.\n\nSince videos are an integral part of the documentation, it is recommended to publish them with an open license.",
					),
			)
			.prop(
				"awards",
				S.array()
					.items(S.string())
					.description("A list of awards won by the software."),
			),
	);

// const descriptionSchema = {
// 	description:
// 		"This section contains a general description of the software. Parsers can use this section for instance to create a web page describing the software.,\n\nNote: since all the strings contained in this section are user-visible and written in a specific language, you must specify the language you are editing the text in (using the IETF BCP 47 specifications) by creating a sub-section with that name. The primary language subtag cannot be omitted, as mandated by the BCP 47.",
// 	type: "object",
// 	additionalProperties: {
// 		type: "object",
// 		additionalProperties: false,
// 		required: ["shortDescription"],
// 		properties: {
// 			localisedName: {
// 				description:
// 					'This key is an opportunity to localise the name in a specific language. It contains the (short) public name of the product. It should be the name most people usually refer to the software. In case the software has both an internal "code" name and a commercial name, use the commercial name.',
// 				type: "string",
// 			},
// 			genericName: {
// 				description:
// 					'This key is the "Generic name", which refers to the specific category to which the software belongs. You can usually find the generic name in the presentation of the software, when you write: "Software xxx is a yyy". Notable examples include "Text Editor", "Word Processor", "Web Browser", "Chat" and so on… The generic name can be up to 35 characters long.',
// 				type: "string",
// 				maxLength: 35,
// 			},
// 			shortDescription: {
// 				description:
// 					"This key contains a short description of the software. It should be a single line containing a single sentence. Maximum 150 characters are allowed.",
// 				type: "string",
// 				maxLength: 150,
// 			},
// 			longDescription: {
// 				description:
// 					"This key contains a longer description of the software, between 500 and 10000 chars. It is meant to provide an overview of the capabilities of the software for a potential user. The audience for this text should be that of users of the software, not developers. You can think of this text as the description of the software that would be in its website (if the software had one).\n\nThis description can contain some basic markdown: *italic*, **bold**, bullet points and [links](#).",
// 				type: "string",
// 				minLength: 150,
// 				maxLength: 10000,
// 			},
// 			documentation: {
// 				description:
// 					"This key contains a reference to the user-level (not developer-level) documentation of the software. The value must be a URL to a hosted version of the documentation.\n\nIt is suggested that the URL points to a hosted version of the documentation that is immediately readable through a common web browser in both desktop and mobile format. The documentation should be rendered in HTML and browsable like a website (with a navigation index, a search bar, etc.).\n\nIf the documentation is instead available only as a document, put a direct view/download link as URL in this key. You should commit the document as part of the source code repository, and then link to it using the code hosting source browser URL (e.g.: GitHub URL to the file). Prefer using open formats like PDF or ODT for maximum interoperability.\n\nWhichever the format for the documentation, remember to make its source files available under an open license, possibly by committing them as part of the repository itself.",
// 				type: "string",
// 				format: "uri",
// 			},
// 			apiDocumentation: {
// 				description:
// 					"This key contains a reference to the API documentation of the software. The value must be a URL to a hosted version of the documentation.\n\nIt is suggested that the URL points to a hosted version of the documentation that is immediately readable through a common web browser. The documentation should be rendered in HTML and browsable like a website (with a navigation index, a search bar, etc.), and if there is a reference or test deployment, possibly offer an interactive interface (e.g. Swagger).\n\nIf the documentation is instead available only as a document, put a direct view/download link as URL in this key. You should commit the document as part of the source code repository, and then link to it using the code hosting source browser URL (e.g.: GitHub URL to the file). Prefer using open formats like PDF or ODT for maximum interoperability.\n\nWhichever the format for the documentation, remember to make its source files available under an open license, possibly by committing them as part of the repository itself.",
// 				type: "string",
// 				format: "uri",
// 			},
// 			features: {
// 				description:
// 					"This key contains a list of software features, describing what capabilities the software allows to do. The audience for this text should be that of public decision makers who will be commissioning the software. The features should thus not target developers; instead of listing technical features referring to implementation details, prefer listing user-visible functionalities of the software.\n\nWhile the key is mandatory, there is no mandatory minimum or maximum number of features that should be listed in this key. Each feature must use a maximum of 100 characters.\n\nThe suggested number of features to list is between 5 and 20, depending on the software size and complexity. There is no need for exhaustiveness, as users can always read the documentation for additional information.",
// 				type: "array",
// 				items: {
// 					type: "string",
// 				},
// 			},
// 			screenshots: {
// 				description:
// 					"This key contains one or multiple paths to files showing screenshots of the software. They are meant to give a quick idea on how the software looks like and how it works. The key value can be the relative path to the file starting from the root of the repository, or it can be an absolute URL pointing to the screenshot in raw version. In both cases, the file must reside inside the same repository where the publiccode.yml file is stored.",
// 				type: "array",
// 				items: {
// 					type: "string",
// 				},
// 			},
// 			videos: {
// 				description:
// 					"This key contains one or multiple URLs of videos showing how the software works. Like screenshots, videos should be used to give a quick overview on how the software looks like and how it works. Videos must be hosted on a video sharing website that supports the oEmbed standard; popular options are YouTube and Vimeo.\n\nSince videos are an integral part of the documentation, it is recommended to publish them with an open license.",
// 				type: "array",
// 				items: {
// 					type: "string",
// 				},
// 			},
// 			awards: {
// 				description: "A list of awards won by the software.",
// 				type: "array",
// 				items: {
// 					type: "string",
// 				},
// 			},
// 		},
// 	},
// };
