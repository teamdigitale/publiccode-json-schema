// Command oracle answers, for each {format, value} read as JSON from stdin,
// whether publiccode-parser-go accepts the value, using the parser's own
// validators. It's the reference the editor's Ajv formats are tested against
// (publiccode-editor/scripts/parity.ts).
//
// Each verdict is "valid", "invalid" or "panic" (the validator crashed).
//
// Usage: go run ./oracle < cases.json > verdicts.json
package main

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"

	"github.com/italia/publiccode-parser-go/v5/validators"
)

type stringer string

func (s stringer) String() string { return string(s) }

// JSON Schema format name -> parser validation tag.
var tags = map[string]string{
	"url_url":                         "url_url",
	"url_http_url":                    "url_http_url",
	"email":                           "email",
	"date":                            "date",
	"mime_type":                       "is_mime_type",
	"spdx_expression":                 "is_spdx_expression",
	"bcp47_strict_language_tag":       "bcp47_strict_language_tag",
	"iso3166_1_alpha2_lower_or_upper": "iso3166_1_alpha2_lower_or_upper",
	"italian_ipa_code":                "is_italian_ipa_code",
	"organisation_uri":                "organisation_uri",
	"supports_id":                     "supports_id",
}

func main() {
	var cases []struct {
		Format string `json:"format"`
		Value  string `json:"value"`
	}
	if err := json.NewDecoder(os.Stdin).Decode(&cases); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	v := validators.New()
	out := make([]string, len(cases))

	for i, c := range cases {
		tag, ok := tags[c.Format]
		if !ok {
			fmt.Fprintf(os.Stderr, "unknown format %q\n", c.Format)
			os.Exit(1)
		}

		out[i] = verdict(func() bool {
			if c.Format == "url_url" || c.Format == "url_http_url" {
				// URL fields are decoded with url.Parse and validated re-serialized.
				u, err := url.Parse(c.Value)

				return err == nil && v.Var(stringer((*url.URL)(u).String()), tag) == nil
			}

			return v.Var(c.Value, tag) == nil
		})
	}

	if err := json.NewEncoder(os.Stdout).Encode(out); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func verdict(check func() bool) (result string) {
	defer func() {
		if recover() != nil {
			result = "panic"
		}
	}()

	if check() {
		return "valid"
	}

	return "invalid"
}
