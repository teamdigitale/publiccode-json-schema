// Command vocab generates the vocabularies used by the custom JSON Schema
// formats (see docs/validation-checklist.md) from the same Go libraries that
// publiccode-parser-go uses, so that the Ajv validator and the Go parser
// accept exactly the same values.
//
// The module versions are pinned in go.mod to the ones the editor's WASM
// validator is built with (publiccode-editor/src/wasm/go.mod).
//
// Usage (from the repository root):
//
//	cd scripts/vocab && go run . ../../data/vocab
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime/debug"
	"sort"
	"strconv"
	"strings"

	"github.com/github/go-spdx/v2/spdxexp/spdxlicenses"
	"github.com/go-playground/validator/v10"
	"github.com/italia/publiccode-parser-go/v5/data"
	"golang.org/x/text/language"
)

const letters = "abcdefghijklmnopqrstuvwxyz"

var validate = validator.New()

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: go run . <output dir>")
		os.Exit(2)
	}

	out := os.Args[1]
	if err := os.MkdirAll(out, 0o755); err != nil {
		fail(err)
	}

	validatorDir := moduleDir("github.com/go-playground/validator/v10")

	write(out, "bcp47.json", map[string]any{
		"languages": languages(),
		"scripts":   scripts(),
		"regions":   regions(),
		"m49":       m49(),
		"variants":  mapKeys(readSource(validatorDir, "language_codes.go"), "iana_subtag_registry_variants"),
		"extlangs":  extlangs(readSource(validatorDir, "language_codes.go")),
	})

	write(out, "countries.json", countries())
	write(out, "countries-alpha3.json", countriesAlpha3())

	write(out, "spdx.json", map[string]any{
		"licenses":   sorted(spdxlicenses.GetLicenses()),
		"deprecated": sorted(spdxlicenses.GetDeprecated()),
		"exceptions": sorted(spdxlicenses.GetExceptions()),
	})

	write(out, "ipa-codes.json", ipaCodes())

	var oembed []string
	if err := json.Unmarshal(data.OembedSchemes, &oembed); err != nil {
		fail(err)
	}
	write(out, "oembed-schemes.json", oembed)

	write(out, "email-regex.json", regexString(readSource(validatorDir, "regexes.go"), "emailRegexString"))

	write(out, "versions.json", versions())
}

// languages returns every 2-3 letter primary language subtag that the
// bcp47_strict_language_tag validator accepts on its own.
func languages() []string {
	var langs []string

	for _, a := range letters {
		for _, b := range letters {
			code := string([]rune{a, b})
			if validate.Var(code, "bcp47_strict_language_tag") == nil {
				langs = append(langs, code)
			}

			for _, c := range letters {
				code := string([]rune{a, b, c})
				if validate.Var(code, "bcp47_strict_language_tag") == nil {
					langs = append(langs, code)
				}
			}
		}
	}

	return langs
}

// scripts returns every ISO 15924 subtag (lowercase) accepted by x/text.
func scripts() []string {
	var s []string

	for _, a := range letters {
		for _, b := range letters {
			for _, c := range letters {
				for _, d := range letters {
					code := string([]rune{a, b, c, d})
					if _, err := language.ParseScript(code); err == nil {
						s = append(s, code)
					}
				}
			}
		}
	}

	return s
}

// regions returns every 2 letter region subtag (lowercase) accepted by x/text.
func regions() []string {
	var r []string

	for _, a := range letters {
		for _, b := range letters {
			code := string([]rune{a, b})
			if _, err := language.ParseRegion(code); err == nil {
				r = append(r, code)
			}
		}
	}

	return r
}

// m49 returns the UN M.49 region codes allowed by the validator, probing
// them through a tag with a known primary language.
func m49() []string {
	var codes []string

	for i := range 1000 {
		code := fmt.Sprintf("%03d", i)
		if validate.Var("en-"+code, "bcp47_strict_language_tag") == nil {
			codes = append(codes, code)
		}
	}

	return codes
}

// countries returns the ISO 3166-1 alpha-2 codes (uppercase).
func countries() []string {
	var c []string

	for _, a := range strings.ToUpper(letters) {
		for _, b := range strings.ToUpper(letters) {
			code := string([]rune{a, b})
			if validate.Var(code, "iso3166_1_alpha2") == nil {
				c = append(c, code)
			}
		}
	}

	return c
}

// countriesAlpha3 maps the ISO 3166-1 alpha-3 codes (lowercase: they
// identify country packages) to their alpha-2 code.
func countriesAlpha3() map[string]string {
	m := map[string]string{}

	for _, a := range strings.ToUpper(letters) {
		for _, b := range strings.ToUpper(letters) {
			for _, c := range strings.ToUpper(letters) {
				code := string([]rune{a, b, c})
				if validate.Var(code, "iso3166_1_alpha3") != nil {
					continue
				}

				// The validator also knows a few codes outside ISO 3166-1
				// (UNK, used by the UN for Kosovo): no alpha-2 to map them to.
				region, err := language.ParseRegion(code)
				if err != nil {
					continue
				}
				m[strings.ToLower(code)] = region.String()
			}
		}
	}

	return m
}

func ipaCodes() []string {
	var codes []string

	for line := range strings.SplitSeq(data.ItIpaCodes, "\n") {
		if line = strings.TrimSpace(line); line != "" {
			codes = append(codes, strings.ToLower(line))
		}
	}

	return sorted(codes)
}

// extlangs parses the extlang -> allowed prefixes map out of the validator
// source, since it isn't exported.
func extlangs(src string) map[string][]string {
	block := mapBlock(src, "iana_subtag_registry_extlangs")
	re := regexp.MustCompile(`"([a-z]+)":\s*\{([^}]*)\}`)
	str := regexp.MustCompile(`"([^"]+)"`)

	m := map[string][]string{}
	for _, match := range re.FindAllStringSubmatch(block, -1) {
		prefixes := []string{}
		for _, p := range str.FindAllStringSubmatch(match[2], -1) {
			prefixes = append(prefixes, strings.ToLower(p[1]))
		}
		m[match[1]] = prefixes
	}

	return m
}

func mapKeys(src, name string) []string {
	block := mapBlock(src, name)
	re := regexp.MustCompile(`(?m)^\s*"([^"]+)":`)

	var keys []string
	for _, match := range re.FindAllStringSubmatch(block, -1) {
		keys = append(keys, match[1])
	}

	return sorted(keys)
}

func mapBlock(src, name string) string {
	start := strings.Index(src, "var "+name+" = ")
	if start < 0 {
		fail(fmt.Errorf("map %s not found", name))
	}

	end := strings.Index(src[start:], "\n}\n")

	return src[start : start+end]
}

func regexString(src, name string) string {
	re := regexp.MustCompile(name + `\s*=\s*"((?:[^"\\]|\\.)*)"`)

	m := re.FindStringSubmatch(src)
	if m == nil {
		fail(fmt.Errorf("regex %s not found", name))
	}

	s, err := strconv.Unquote(`"` + m[1] + `"`)
	if err != nil {
		fail(err)
	}

	return s
}

func versions() map[string]string {
	info, ok := debug.ReadBuildInfo()
	if !ok {
		fail(fmt.Errorf("no build info"))
	}

	v := map[string]string{}
	for _, dep := range info.Deps {
		v[dep.Path] = dep.Version
	}

	return v
}

func moduleDir(path string) string {
	info, _ := debug.ReadBuildInfo()
	for _, dep := range info.Deps {
		if dep.Path == path {
			cache, err := exec.Command("go", "env", "GOMODCACHE").Output()
			if err != nil {
				fail(err)
			}

			return filepath.Join(strings.TrimSpace(string(cache)), path+"@"+dep.Version)
		}
	}

	fail(fmt.Errorf("module %s not found", path))

	return ""
}

func readSource(dir, file string) string {
	b, err := os.ReadFile(filepath.Join(dir, file))
	if err != nil {
		fail(err)
	}

	return string(b)
}

func sorted(s []string) []string {
	s = append([]string(nil), s...)
	sort.Strings(s)

	return s
}

func write(dir, name string, v any) {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		fail(err)
	}

	if err := os.WriteFile(filepath.Join(dir, name), append(b, '\n'), 0o644); err != nil {
		fail(err)
	}
}

func fail(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}
