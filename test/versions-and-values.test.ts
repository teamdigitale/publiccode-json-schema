import { describe, expect, test } from "bun:test";
import { parse } from "yaml";
import { categories, kinds, platforms, scopes, statuses } from "../src/constants";
import { LATEST_SUPPORTED, upgrade, valueLabel, vocabulary } from "../src";
import { validateVersion } from "../src/validator";

// A 0.2 file using keys that only exist since 0.5.0 (organisation) and the IT
// section, deprecated in 0.7.0: valid for the parser, not for the 0.2.0 schema.
const old = `
publiccodeYmlVersion: "0.2"
name: Medusa
url: https://github.com/italia/developers.italia.it.git
releaseDate: "2024-01-01"
platforms: [web]
categories: [document-management]
developmentStatus: stable
softwareType: standalone/web
organisation:
  uri: urn:x-italian-pa:pcm
description:
  it:
    genericName: Gestionale
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
IT:
  riuso:
    codiceIPA: pcm
`;

describe("vocabulary labels", () => {
  test("the label keys are exactly the schema vocabularies", () => {
    const keys = (f: Parameters<typeof vocabulary>[0]) => vocabulary(f).map((v) => v.value).sort();
    expect(keys("categories")).toEqual([...categories].sort());
    expect(keys("intendedAudience.scope")).toEqual([...scopes].sort());
    expect(keys("developmentStatus")).toEqual([...statuses].sort());
    expect(keys("softwareType")).toEqual([...kinds].sort());
    expect(keys("platforms")).toEqual([...platforms].sort());
  });

  test("labels by language, falling back to English and then to the value", () => {
    expect(valueLabel("categories", "accounting", "it")).toBe("Contabilità");
    expect(valueLabel("categories", "accounting", "it-IT")).toBe("Contabilità");
    expect(valueLabel("categories", "accounting")).toBe("Accounting");
    expect(valueLabel("categories", "accounting", "de")).toBe("Accounting");
    expect(valueLabel("categories", "not-a-category", "it")).toBe("not-a-category");
    expect(valueLabel("intendedAudience.scope", "local-authorities", "it")).toBe("Enti locali");
  });

  test("values added and deprecated across versions", () => {
    const v020 = vocabulary("categories", { version: "0.2.0" }).map((v) => v.value);
    expect(v020).not.toContain("design");
    expect(vocabulary("categories", { version: "0.4.0" }).map((v) => v.value)).toContain("design");
    expect(vocabulary("intendedAudience.scope").find((v) => v.value === "government")?.deprecated?.since).toBe("0.8.0");
  });
});

describe("validateVersion", () => {
  const data = parse(old);

  test("by default the declared version, with the parser's rules", async () => {
    const r = await validateVersion(data);
    expect(r).toMatchObject({ valid: true, declaredVersion: "0.2", checkedVersion: "0.2.0", schema: "v0", strict: false });
  });

  test("strict: keys the version doesn't have are errors", async () => {
    const r = await validateVersion(data, { strict: true });
    expect(r.valid).toBe(false);
    expect(r.schema).toBe("0.2.0");
    expect(r.errors.map((e) => e.key).sort()).toEqual(["IT", "organisation"]);
  });

  test("strict against another version: version mismatch, and its deprecations", async () => {
    const r = await validateVersion(data, { strict: true, version: "0.7" });
    expect(r.checkedVersion).toBe("0.7.0");
    expect(r.warnings[0]?.key).toBe("publiccodeYmlVersion");
    expect(r.errors.map((e) => e.key)).toContain("publiccodeYmlVersion");
    expect(r.deprecations.map((d) => d.key)).toContain("IT.riuso.codiceIPA");
  });

  test("after upgrade() the file passes the strict check of the latest supported version", async () => {
    const up = upgrade(data, { to: LATEST_SUPPORTED });
    const r = await validateVersion(up.data, { strict: true });
    expect(r.checkedVersion).toBe(LATEST_SUPPORTED);
    expect(r.errors).toEqual([]);
    expect(r.valid).toBe(true);
  });

  test("an invalid version is rejected", async () => {
    await expect(validateVersion(data, { version: "latest" })).rejects.toThrow();
  });
});

describe("publiccode.yml 0.8", () => {
  const v08 = { ...parse(old), publiccodeYmlVersion: "0.8.0" } as Record<string, unknown>;
  delete v08.IT;
  delete v08.organisation;

  test("0.8.0 is accepted, with no 'not the latest version' warning", async () => {
    const r = await validateVersion(v08);
    expect(r.declaredVersion).toBe("0.8.0");
    expect(r.checkedVersion).toBe("0.8.0");
    expect(r.errors).toEqual([]);
    expect(r.warnings.map((w) => w.key)).not.toContain("publiccodeYmlVersion");
  });

  test("WebP and AVIF images since 0.8, not before", async () => {
    const ok = await validateVersion({ ...v08, logo: "img/logo.webp" });
    expect(ok.errors).toEqual([]);
    const old07 = await validateVersion({ ...v08, publiccodeYmlVersion: "0.7.0", logo: "img/logo.avif" });
    expect(old07.errors.map((e) => e.key)).toEqual(["logo"]);
  });

  test("the Go parser still stops at 0.7", async () => {
    const { isSupportedByParser, PARSER_LATEST, LATEST_SUPPORTED: latest } = await import("../src");
    expect(latest).toBe("0.8.0");
    expect(PARSER_LATEST).toBe("0.7.0");
    expect(isSupportedByParser("0.8.0")).toBe(false);
    expect(isSupportedByParser("0.7")).toBe(true);
  });
});
