import { describe, expect, test } from "bun:test";
import { countries, isReleaseCandidate, schemaVersionFor, upgrade } from "../src";
import { validateVersion } from "../src/validator";

// publiccode.yml 1.0 as on the standard's 1.0-rc branch: what 0.x deprecated is gone.
const v1 = {
  publiccodeYmlVersion: "1.0.0",
  name: "Medusa",
  url: "https://github.com/italia/developers.italia.it.git",
  platforms: ["web"],
  developmentStatus: "stable",
  softwareType: "standalone/web",
  organisation: { uri: "urn:x-italian-pa:pcm", name: "Presidenza del Consiglio dei Ministri" },
  intendedAudience: { countries: ["IT"], scope: ["local-authorities"] },
  description: {
    it: {
      shortDescription: "Un software di esempio per i test del validatore",
      longDescription:
        "Descrizione lunga del software di esempio, abbastanza lunga da superare il minimo di centocinquanta caratteri richiesto dallo standard publiccode.yml per questo campo.",
      features: ["Una funzionalità"],
    },
  },
  legal: { license: "AGPL-3.0-or-later" },
  maintenance: { type: "internal", contacts: [{ name: "Mario Rossi", phone: "+390612345678" }] },
  localisation: { localisationReady: true, availableLanguages: ["it"] },
};

const keysOf = (r: { errors: { key: string }[] }) => r.errors.map((e) => e.key).sort();

describe("publiccode.yml 1.0 (release candidate)", () => {
  test("is a release candidate, and '1' maps to it", () => {
    expect(isReleaseCandidate("1")).toBe(true);
    expect(isReleaseCandidate("0.8.0")).toBe(false);
    expect(schemaVersionFor("1")).toBe("1.0.0");
  });

  test("a 1.0 file is valid, declared as 1, 1.0 or 1.0.0", async () => {
    for (const publiccodeYmlVersion of ["1", "1.0", "1.0.0"]) {
      const r = await validateVersion({ ...v1, publiccodeYmlVersion });
      expect(r).toMatchObject({ valid: true, checkedVersion: "1.0.0", schema: "1.0.0", strict: true });
    }
  });

  test("the keys and values 0.x deprecated are errors", async () => {
    const r = await validateVersion({
      ...v1,
      monochromeLogo: "logo-mono.svg",
      legal: { license: "MIT", repoOwner: "PCM", authorsFile: "AUTHORS" },
      intendedAudience: { countries: ["it"], scope: ["government"] },
      IT: { riuso: { codiceIPA: "pcm" } },
    });
    expect(r.valid).toBe(false);
    expect(keysOf(r)).toEqual([
      "IT",
      "intendedAudience.countries[0]",
      "intendedAudience.scope[0]",
      "legal.authorsFile",
      "legal.repoOwner",
      "monochromeLogo",
    ]);
    // Already errors: not reported again as deprecation warnings
    expect(r.warnings.map((w) => w.key)).not.toContain("monochromeLogo");
  });

  test("the phone number must be E.164", async () => {
    const r = await validateVersion({ ...v1, maintenance: { type: "internal", contacts: [{ name: "Mario", phone: "06 1234 5678" }] } });
    expect(keysOf(r)).toEqual(["maintenance.contacts[0].phone"]);
  });

  test("a 0.x file checked against 1.0.0: version error and mismatch warning", async () => {
    const r = await validateVersion({ ...v1, publiccodeYmlVersion: "0.8.0" }, { version: "1.0.0" });
    expect(keysOf(r)).toEqual(["publiccodeYmlVersion"]);
    expect(r.warnings[0]?.key).toBe("publiccodeYmlVersion");
  });

  test("upgrade() from 0.x to 1.0.0", async () => {
    const old = {
      ...v1,
      publiccodeYmlVersion: "0.4",
      organisation: undefined,
      legal: { license: "MIT", repoOwner: "Presidenza del Consiglio dei Ministri" },
      intendedAudience: { countries: ["it"], scope: ["government", "culture"] },
      maintenance: { type: "internal", contacts: [{ name: "Mario", phone: "+39 06 1234 5678" }, { name: "Anna", phone: "06 1234" }] },
      IT: { riuso: { codiceIPA: "pcm" }, piattaforme: { spid: true } },
    };
    const lossless = upgrade(old, { to: "1.0.0", countries });
    // The government scope needs lossy: true; a phone with no prefix needs a person
    expect(lossless.remaining.map((f) => f.id).sort()).toEqual(["governmentScope", "phoneE164"]);

    const u = upgrade(old, { to: "1.0.0", countries, lossy: true });
    expect(u.data).toMatchObject({
      publiccodeYmlVersion: "1.0.0",
      organisation: { uri: "urn:x-italian-pa:pcm", name: "Presidenza del Consiglio dei Ministri" },
      intendedAudience: { countries: ["IT"], scope: ["culture"] },
      supports: [{ id: "alias:spid" }],
    });
    expect((u.data.maintenance as { contacts: { phone: string }[] }).contacts.map((c) => c.phone)).toEqual(["+390612345678", "06 1234"]);
    expect(u.data.IT).toBeUndefined();
    const r = await validateVersion(u.data);
    expect(keysOf(r)).toEqual(["maintenance.contacts[1].phone"]);
  });
});
