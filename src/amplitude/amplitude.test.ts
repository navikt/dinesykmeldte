import { describe, expect, it } from "vitest";
import { sanitizeAmplitudeOrigin } from "./amplitude";

describe("sanitizeAmplitudeOrigin", () => {
  it("fjerner sykmeldtId fra /sykmeldt/<id>/sykmeldinger", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/sykmeldinger",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/sykmeldinger");
  });

  it("bevarer basePath og fjerner sykmeldtId fra faktisk NAV-rute", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/abc-123-xyz/sykmeldinger",
        "/arbeidsgiver/sykmeldte",
      ),
    ).toEqual(
      "https://www.nav.no/arbeidsgiver/sykmeldte/sykmeldt/[id]/sykmeldinger",
    );
  });

  it("maskerer dynamisk id selv når verdien matcher et kjent statisk segment", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/soknader/sykmeldinger",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/sykmeldinger");
  });

  it("fjerner sykmeldtId fra /sykmeldt/<id>/soknader", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/soknader",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/soknader");
  });

  it("fjerner sykmeldtId fra /sykmeldt/<id>/meldinger", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/meldinger",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/meldinger");
  });

  it("fjerner sykmeldtId og sykmeldingId fra /sykmeldt/<id>/sykmelding/<id>", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/sykmelding/def-456-uvw",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/sykmelding/[id]");
  });

  it("fjerner sykmeldtId og soknadId fra /sykmeldt/<id>/soknad/<id>", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/soknad/def-456-uvw",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/soknad/[id]");
  });

  it("fjerner sykmeldtId og meldingId fra /sykmeldt/<id>/melding/<id>", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/melding/def-456-uvw",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/melding/[id]");
  });

  it("fjerner sykmeldtId fra rot-nivå /<id>", () => {
    expect(
      sanitizeAmplitudeOrigin("https://dinesykmeldte.nav.no/abc-123-xyz"),
    ).toEqual("https://dinesykmeldte.nav.no/[id]");
  });

  it("maskerer ukjente ruter konservativt", () => {
    expect(
      sanitizeAmplitudeOrigin("https://dinesykmeldte.nav.no/ukjent/rute"),
    ).toEqual("https://dinesykmeldte.nav.no/[id]/[id]");
  });

  it("bevarer statiske stier uten dynamiske segmenter", () => {
    expect(
      sanitizeAmplitudeOrigin("https://dinesykmeldte.nav.no/info/oppfolging"),
    ).toEqual("https://dinesykmeldte.nav.no/info/oppfolging");
  });

  it("bevarer statisk sti /info/sporsmal-og-svar", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/info/sporsmal-og-svar",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/info/sporsmal-og-svar");
  });

  it("bevarer rotstien /", () => {
    expect(sanitizeAmplitudeOrigin("https://dinesykmeldte.nav.no/")).toEqual(
      "https://dinesykmeldte.nav.no/",
    );
  });

  it("stripper query-parametere fra URLen", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/sykmeldinger?foo=bar",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/sykmeldinger");
  });

  it("stripper hash fra URLen", () => {
    expect(
      sanitizeAmplitudeOrigin(
        "https://dinesykmeldte.nav.no/sykmeldt/abc-123-xyz/sykmeldinger#toppen",
      ),
    ).toEqual("https://dinesykmeldte.nav.no/sykmeldt/[id]/sykmeldinger");
  });

  it("returnerer safe fallback for ugyldig URL", () => {
    expect(sanitizeAmplitudeOrigin("ikke-en-url")).toEqual("[invalid-url]");
  });
});
