import { addDays, formatISO } from "date-fns";
import { describe, expect, it } from "vitest";
import { ALLE_ANSATTE, ANSATT_MAP } from "../data/scenarier";
import type { Dm1Status } from "../types";
import {
  aktivHendelseId,
  dm1FristDato,
  utledAktueltNa,
  utledTidslinje,
} from "./oppfolging";

const datoOm = (days: number) =>
  formatISO(addDays(new Date(), days), { representation: "date" });
const synlig: Dm1Status = { type: "synlig" };
const skjult: Dm1Status = { type: "skjult" };

describe("påminnelse om arbeidsgivers dialogmøte 1", () => {
  it("viser arbeidsgivers plikt og sjukeukersfristen ved helt fravær", () => {
    const ansatt = ANSATT_MAP.ada;
    const aktuelt = utledAktueltNa(ansatt, synlig);
    expect(aktuelt).toMatchObject({
      tittel: "Dialogmøte 1",
      fristDato: dm1FristDato(ansatt),
      kategori: "na",
      hendelseId: "dm1",
      handling: { id: "forbered-dm1" },
    });
    expect(aktuelt.beskrivelse).toContain("Som arbeidsgiver skal du");
    expect(aktuelt.beskrivelse).toContain("åpenbart unødvendig");
  });

  it("gir gradert sykmelding en vurdering, ikke en ubetinget sjukeukersfrist", () => {
    const ansatt = ANSATT_MAP.emil;
    const aktuelt = utledAktueltNa(ansatt, synlig);
    expect(aktuelt).toMatchObject({
      fristDato: null,
      hendelseId: "dm1",
      kategori: "na",
    });
    expect(aktuelt.beskrivelse).toContain("den ansatte eller sykmelder");
    expect(aktuelt.beskrivelse).toContain("hensiktsmessig");
    expect(
      utledTidslinje(ansatt, synlig).find((event) => event.id === "dm1"),
    ).toMatchObject({ dato: null, datoTekst: "Vurderes ved behov" });
  });

  it("lar tidlig DM1 ligge under kommende, med forberedelse tilgjengelig", () => {
    const ansatt = ANSATT_MAP.liv;
    expect(utledAktueltNa(ansatt, synlig)).toMatchObject({
      kategori: "kommende",
      handling: { id: "forbered-dm1" },
      hendelseId: "dm1",
    });
    expect(aktivHendelseId(ansatt, synlig)).toBeNull();
  });

  it("gjør ikke en passert frist til et lovbrudd eller antatt manglende møte", () => {
    const ansatt = ANSATT_MAP.kai;
    expect(utledAktueltNa(ansatt, synlig)).toMatchObject({
      tittel: "Dialogmøte 1",
      begrunnelse: "Nav vet ikke om møtet er gjennomført",
      tempo: "aktuelt",
      kategori: "na",
    });
    expect(
      utledTidslinje(ansatt, synlig).find((event) => event.id === "dm1"),
    ).toMatchObject({ status: "ukjent", kilde: "forventet" });
    expect(aktivHendelseId(ansatt, synlig)).toBe("dm1");
  });

  it("skjuler en påminnelse uten å fremstille møtet som gjennomført eller unntatt", () => {
    const ansatt = ANSATT_MAP.ada;
    const aktuelt = utledAktueltNa(ansatt, skjult);
    expect(aktuelt).toMatchObject({
      tittel: "Dialogmøte 1",
      kategori: "avventer",
      fristDato: null,
      hendelseId: "dm1",
      handling: { id: "vis-dm1" },
    });
    expect(aktuelt.beskrivelse).toContain(
      "Dette sier ikke om møtet er gjennomført",
    );
    expect(aktivHendelseId(ansatt, skjult)).toBeNull();
    const event = utledTidslinje(ansatt, skjult).find((e) => e.id === "dm1");
    expect(event).toMatchObject({
      dato: dm1FristDato(ansatt),
      status: "ukjent",
      kilde: "forventet",
    });
  });

  it("viser påminnelsen igjen med samme frist, uten å opprette en møteavtale", () => {
    const ansatt = ANSATT_MAP.noor;
    expect(utledAktueltNa(ansatt, ansatt.dm1Start).kategori).toBe("avventer");
    expect(utledAktueltNa(ansatt, synlig)).toMatchObject({
      kategori: "na",
      fristDato: dm1FristDato(ansatt),
      handling: { id: "forbered-dm1" },
    });
    expect(
      utledTidslinje(ansatt, synlig).filter((e) => e.id === "dm1"),
    ).toHaveLength(1);
  });

  it("lar planens oppfølging og andre tjenester eie avtalene sine", () => {
    const ansatt = {
      ...ANSATT_MAP.ada,
      oppfolgingsplan: {
        ...ANSATT_MAP.ada.oppfolgingsplan,
        evalueresDato: datoOm(1),
      },
      motebehov: {
        besvart: true,
        besvartDato: datoOm(-1),
        innkallingDato: datoOm(2),
      },
      sykepenger: {
        maksdato: datoOm(14),
        gjenstaendeDager: 10,
        erAnslag: true,
      },
    };
    expect(utledAktueltNa(ansatt, synlig).hendelseId).toBe("dm1");
    expect(utledAktueltNa(ansatt, skjult).kategori).toBe("avventer");
    expect(utledTidslinje(ansatt, synlig).map((e) => e.id)).toEqual([
      "sykmelding-0",
      "plan",
      "dm1",
    ]);
  });

  it("viser bare planhendelser når planen er kjent i Navs løsning", () => {
    const ansatt = ANSATT_MAP.kai;
    expect(utledTidslinje(ansatt, synlig).some((e) => e.id === "plan")).toBe(
      false,
    );
    expect(utledAktueltNa(ansatt, synlig).handling.id).toBe("forbered-dm1");
  });

  it("holder 25 separate fiktive forløp innenfor DM1-fokuset", () => {
    expect(ALLE_ANSATTE).toHaveLength(25);
    expect(new Set(ALLE_ANSATTE.map((ansatt) => ansatt.id)).size).toBe(25);
    for (const ansatt of ALLE_ANSATTE) {
      expect(ansatt.antallSykmeldinger).toBe(ansatt.perioder.length);
      expect(utledAktueltNa(ansatt, ansatt.dm1Start).hendelseId).toBe("dm1");
      const events = utledTidslinje(ansatt, ansatt.dm1Start);
      expect(events.find((e) => e.id === "dm1")?.status).toBe("ukjent");
      expect(
        events.some((e) => e.id.startsWith("dm2") || e.id === "maksdato"),
      ).toBe(false);
    }
  });
});
