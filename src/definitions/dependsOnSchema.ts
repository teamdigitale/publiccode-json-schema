import S from "fluent-json-schema";

export default S.object()
	.id("#dependsOn")
	.additionalProperties(false)
	.title("Depends On")
	.description(
		"This section provides an overview on the system-level dependencies required to install and use this software.\n\nNOTE: do not list dependencies at the source code level (e.g.: software libraries being used), and focus only on runtime and/or system-level dependencies that must be installed and maintained separately. For instance, a database is a good example of such dependencies.",
	)
	.prop(
		"open",
		S.array()
			.items(S.ref("#dependency"))
			.description(
				"This key contains a list of runtime dependencies that are distributed under an open-source license.",
			),
	)
	.prop(
		"proprietary",
		S.array()
			.items(S.ref("#dependency"))
			.description(
				"This key contains a list of runtime dependencies that are distributed under a proprietary license.",
			),
	)
	.prop(
		"hardware",
		S.array()
			.items(S.ref("#dependency"))
			.description(
				"This key contains a list of hardware dependencies that must be owned to use the software.",
			),
	);

// const dependsOnSchema = {
// 	description:
// 		"This section provides an overview on the system-level dependencies required to install and use this software.\n\nNOTE: do not list dependencies at the source code level (e.g.: software libraries being used), and focus only on runtime and/or system-level dependencies that must be installed and maintained separately. For instance, a database is a good example of such dependencies.",
// 	type: "object",
// 	additionalProperties: false,
// 	properties: {
// 		open: {
// 			description:
// 				"This key contains a list of runtime dependencies that are distributed under an open-source license.",
// 			type: "array",
// 			items: {
// 				$ref: "#dependency",
// 			},
// 		},
// 		proprietary: {
// 			description:
// 				"This key contains a list of runtime dependencies that are distributed under a proprietary license.",
// 			type: "array",
// 			items: {
// 				$ref: "#dependency",
// 			},
// 		},
// 		hardware: {
// 			description:
// 				"This key contains a list of hardware dependencies that must be owned to use the software.",
// 			type: "array",
// 			items: {
// 				$ref: "#dependency",
// 			},
// 		},
// 	},
// };
