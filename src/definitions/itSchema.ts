import S from "fluent-json-schema";

export default S.object()
	.id("#IT")
	.title("Italy Extension")
	.description("Schema for the Italy country extension")
	.additionalProperties(false)
	.prop(
		"countryExtensionVersion",
		S.string().description(
			"This key specifies the version to which the current extension schema adheres to, for forward compatibility.\n\nPlease note how the value of this key is independent from the top-level publiccodeYmlVersion one (see The Standard (core)). In such a way, the extensions schema versioning is independent both from the core version of the schema and from every other Country.",
		),
	)
	.prop(
		"conforme",
		S.object()
			.additionalProperties(false)
			.description(
				"This section contains the keys for auto-declaring the compliance with the current legislation, with respect to the following sections. Not including these keys implies that the compliance is not known or not declared.",
			)
			.prop(
				"lineeGuidaDesign",
				S.boolean().description(
					"If present and set to true, the software is compliant with the Italian accessibility laws (L. 4/2004), as further explained in the linee guida di design (Italian language).",
				),
			)
			.prop(
				"modelloInteroperabilita",
				S.boolean().description(
					"If present and set to true, the software is compliant with the linee guida sull'interoperabilità.\n\nRegulatory reference: Art. 73 del CAD (Italian language).",
				),
			)
			.prop(
				"misureMinimeSicurezza",
				S.boolean().description(
					"If present and set to true, the software is compliant with the Misure minime di sicurezza ICT per le Pubbliche amministrazioni (Italian language).",
				),
			)
			.prop(
				"gdpr",
				S.boolean().description(
					"If present and set to true, the software is compliant with the Misure minime di sicurezza ICT per le Pubbliche amministrazioni (Italian language).",
				),
			),
	)
	.prop(
		"piattaforme",
		S.object()
			.additionalProperties(false)
			.prop(
				"spid",
				S.boolean().description(
					"If present and set to true, the software interfaces with SPID - il Sistema Pubblico di Identità Digitale.",
				),
			)
			.prop(
				"cie",
				S.boolean().description(
					"If present and set to true, the software interfaces with the Italian electronic ID card (Carta d'Identità Elettronica).",
				),
			)
			.prop(
				"anpr",
				S.boolean().description(
					"If present and set to true, the software interfaces with ANPR.",
				),
			)
			.prop(
				"pagopa",
				S.boolean().description(
					"If present and set to true, the software interfaces with pagoPA.",
				),
			)
			.prop(
				"io",
				S.boolean().description(
					"If present and set to true, the software interfaces with IO app (https://io.italia.it) ",
				),
			),
	)
	.prop(
		"riuso",
		S.object()
			.additionalProperties(false)
			.prop(
				"codiceIPA",
				S.string().description(
					"This key represents the administration code inside the Public Administration index (codice IPA).",
				),
			),
	);
