module github.com/teamdigitale/publiccode-json-schema/scripts/vocab

go 1.25.0

// Keep in sync with publiccode-editor/src/wasm/go.mod, so the generated
// vocabularies match the parser the editor ships.
require (
	github.com/github/go-spdx/v2 v2.7.0
	github.com/go-playground/validator/v10 v10.30.3
	github.com/italia/publiccode-parser-go/v5 v5.4.3
	golang.org/x/text v0.37.0
)

require (
	github.com/gabriel-vasile/mimetype v1.4.13 // indirect
	github.com/go-playground/locales v0.14.1 // indirect
	github.com/go-playground/universal-translator v0.18.1 // indirect
	github.com/leodido/go-urn v1.4.0 // indirect
	golang.org/x/crypto v0.52.0 // indirect
	golang.org/x/sys v0.45.0 // indirect
)
