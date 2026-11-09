import { describe, expect, test } from "bun:test";
import { parse } from "yaml";
import { validate } from "../src/validator";

const valid = `
publiccodeYmlVersion: "0"
name: Medusa
url: https://github.com/italia/developers.italia.it.git
platforms: [web]
developmentStatus: stable
softwareType: standalone/web
description:
  it:
    shortDescription: Un software di esempio per i test del validatore
    longDescription: >
      Descrizione lunga del software di esempio, abbastanza lunga da superare il minimo di
      centocinquanta caratteri richiesto dallo standard publiccode.yml per questo campo.
    features: [Una funzionalità]
legal:
  license: AGPL-3.0-or-later
maintenance:
  type: none
localisation:
  localisationReady: true
  availableLanguages: [it]
`;

describe("validate", () => {
  test("a valid file has no errors", () => {
    const r = validate(parse(valid));
    expect(r.errors).toEqual([]);
  });

  test("missing version stops validation like the parser", () => {
    const r = validate({ name: "x" });
    expect(r.errors.map((e) => e.key)).toEqual(["publiccodeYmlVersion"]);
  });

  test("custom formats are applied (SPDX license)", () => {
    const doc = parse(valid);
    doc.legal.license = "not-a-license";
    expect(validate(doc).errors.map((e) => e.key)).toContain("legal.license");
  });

  test("older versions produce the 'not the latest version' warning", () => {
    const doc = parse(valid);
    doc.publiccodeYmlVersion = "0.2";
    expect(validate(doc).warnings.map((w) => w.key)).toContain("publiccodeYmlVersion");
  });
});
