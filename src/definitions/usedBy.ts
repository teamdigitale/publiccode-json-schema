import S from "fluent-json-schema";

export default S.array()
	.items(S.string())
	.description(
		'A list of the names of prominent public administrations (that will serve as "testimonials") that are currently known to the software maintainer to be using this software.\n\nParsers are encouraged to enhance this list also with other information that can obtain independently; for instance, a fork of a software, owned by an administration, could be used as a signal of usage of the software.',
	);
