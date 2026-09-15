import { addDays, formatISO } from "date-fns";
import { describe, expect, it } from "vitest";
import { ALLE_ANSATTE, ANSATT_MAP } from "../data/scenarier";
import type { Dm1Status } from "../types";
import {
  aktivHendelseId,
  dm1FristDato,
  erFortid,
  utledAktuelleHendelser,
  utledAktueltNa,
  utledTidslinje,
} from "./oppfolging";

const datoOm = (days: number) =>
  formatISO(addDays(new Date(), days), { representation: "date" });
const synlig: Dm1Status = { type: "synlig" };
const skjult: Dm1Status = { type: "skjult" };

const dm1Punkt = (id: string, status: Dm1Status = synlig) =>
  utledTidslinje(ANSATT_MAP[id], status).find((event) => event.id === "dm1");

describe("påminnelse om arbeidsgivers dialogmøte 1", () => {
  it("viser arbeidsgivers plikt og sjukeukersfristen ved helt fravær", () => {
    const ansatt = ANSATT_MAP.ada;
    const aktuelt = utledAktueltNa(ansatt, synlig);
    expect(aktuelt).toMatchObject({
      tittel: "Dialogmøte 1",
      fristDato: dm1FristDato(ansatt),
      datoEtikett: "Frist",
      kategori: "na",
      hendelseId: "dm1",
      handling: { id: "forbered-dm1" },
    });
    expect(aktuelt.beskrivelse).toContain("Som arbeidsgiver skal du");
    expect(aktuelt.beskrivelse).toContain("åpenbart unødvendig");
  });

  it("gir gradert sykmelding en vurdering, ikke en ubetinget sjukeukersfrist", () => {
    const aktuelt = utledAktuelleHendelser(ANSATT_MAP.emil, synlig).find(
      (event) => event.hendelseId === "dm1",
    );
    expect(aktuelt).toMatchObject({ fristDato: null, kategori: "na" });
    expect(aktuelt?.beskrivelse).toContain("den ansatte eller sykmelder");
    expect(aktuelt?.beskrivelse).toContain("hensiktsmessig");
    expect(dm1Punkt("emil")).toMatchObject({
      dato: null,
      datoTekst: "Vurderes ved behov",
    });
  });

  it("lar tidlig DM1 ligge under kommende med forberedelse tilgjengelig", () => {
    const ansatt = ANSATT_MAP["ansatt-7"];
    expect(utledAktueltNa(ansatt, synlig)).toMatchObject({
      kategori: "kommende",
      handling: { id: "forbered-dm1" },
      hendelseId: "dm1",
    });
    expect(aktivHendelseId(ansatt, synlig)).toBeNull();
  });

  it("gjør ikke en passert frist til lovbrudd eller antatt manglende møte", () => {
    expect(utledAktueltNa(ANSATT_MAP.kai, synlig)).toMatchObject({
      tittel: "Dialogmøte 1",
      begrunnelse: "Nav vet ikke om møtet er gjennomført",
      tempo: "aktuelt",
      kategori: "na",
    });
    expect(dm1Punkt("kai")).toMatchObject({
      status: "ukjent",
      kilde: "forventet",
    });
    expect(aktivHendelseId(ANSATT_MAP.kai, synlig)).toBe("dm1");
  });

  it("skjuler påminnelsen uten å gjøre møtet gjennomført eller unntatt", () => {
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
    expect(utledAktuelleHendelser(ansatt, skjult)).toEqual([]);
    expect(aktivHendelseId(ansatt, skjult)).toBeNull();
    expect(dm1Punkt("ada", skjult)).toMatchObject({
      dato: dm1FristDato(ansatt),
      status: "ukjent",
      kilde: "forventet",
    });
  });

  it("viser påminnelsen igjen uten å opprette en ny møteavtale", () => {
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

  it("beholder historisk DM1 ukjent og bruker gradering fra tidlig forløp", () => {
    for (const id of ["jonas", "liv"]) {
      expect(dm1Punkt(id)).toMatchObject({
        dato: dm1FristDato(ANSATT_MAP[id]),
        status: "ukjent",
        kilde: "forventet",
      });
      expect(dm1Punkt(id)?.datoTekst).toBeUndefined();
      expect(
        utledAktuelleHendelser(ANSATT_MAP[id], synlig).some(
          (event) => event.hendelseId === "dm1",
        ),
      ).toBe(false);
    }
  });
});

describe("samtidige oppgaver og kontekst i forløpet", () => {
  it("viser planens avtale uten å overta redigeringen eller fjerne DM1", () => {
    const ansatt = ANSATT_MAP.emil;
    const aktuelle = utledAktuelleHendelser(ansatt, synlig);
    expect(aktuelle.map((e) => e.hendelseId)).toEqual([
      "plan-evaluering",
      "dm1",
    ]);
    expect(aktuelle[0]).toMatchObject({
      datoEtikett: "Avtalt oppfølging",
      fristDato: ansatt.oppfolgingsplan.evalueresDato,
      handling: { id: "ga-til-plan" },
    });
    expect(
      utledTidslinje(ansatt, synlig).find((e) => e.id === "plan-evaluering"),
    ).toMatchObject({
      status: "planlagt",
      kilde: "kjent",
      handling: { id: "ga-til-plan" },
    });
    expect(
      utledAktuelleHendelser(ansatt, skjult).map((e) => e.hendelseId),
    ).toEqual(["plan-evaluering"]);
  });

  it("viser både faktisk innkalling og nær maksdato for Liv", () => {
    const aktuelle = utledAktuelleHendelser(ANSATT_MAP.liv, synlig);
    expect(aktuelle.map((e) => e.hendelseId)).toEqual([
      "dm2-innkalling",
      "maksdato",
    ]);
    expect(aktuelle[0].datoEtikett).toBe("Møtedato");
    expect(aktuelle[1].datoEtikett).toBe("Maksdato");
    expect(utledAktueltNa(ANSATT_MAP.liv, skjult).hendelseId).toBe(
      "dm2-innkalling",
    );
  });

  it("sorterer nære avtaler etter dato uten å fjerne samtidige oppgaver", () => {
    const ansatt = {
      ...ANSATT_MAP.ada,
      oppfolgingsplan: {
        ...ANSATT_MAP.ada.oppfolgingsplan,
        evalueresDato: datoOm(5),
      },
      motebehov: {
        besvart: true,
        besvartDato: datoOm(-1),
        innkallingDato: datoOm(3),
      },
    };
    expect(
      utledAktuelleHendelser(ansatt, synlig).map((e) => e.hendelseId),
    ).toEqual(["dm2-innkalling", "plan-evaluering", "dm1"]);
  });

  it("beholder utestående møtebehov sammen med planoppfølging og DM1", () => {
    const ansatt = {
      ...ANSATT_MAP.emil,
      motebehov: { besvart: false, besvartDato: null, innkallingDato: null },
    };
    expect(
      utledAktuelleHendelser(ansatt, synlig).map((e) => e.hendelseId),
    ).toEqual(["motebehov", "plan-evaluering", "dm1"]);
    const amir = ANSATT_MAP["ansatt-10"];
    expect(utledAktueltNa(amir, synlig).handling.id).toBe("svar-motebehov");
  });

  it("skiller Jonas sitt sendte svar fra en avtale og et fremtidig stoppunkt", () => {
    const ansatt = ANSATT_MAP.jonas;
    expect(utledAktueltNa(ansatt, synlig)).toMatchObject({
      tittel: "Avventer Navs vurdering",
      kategori: "avventer",
      hendelseId: null,
    });
    const events = utledTidslinje(ansatt, synlig);
    expect(events.find((e) => e.id === "motebehov")).toMatchObject({
      status: "gjennomfort",
      kilde: "kjent",
    });
    expect(events.find((e) => e.id === "dm2-vurdering")).toMatchObject({
      dato: null,
      status: "forventet",
      kilde: "forventet",
    });
    expect(events.some((e) => e.id === "dm2-innkalling")).toBe(false);
    expect(events.findIndex((e) => e.id === "dm2-vurdering")).toBeLessThan(
      events.findIndex((e) => e.id === "maksdato"),
    );
  });

  it("viser kommende stoppunkter også når DM1 er nærmest nå", () => {
    const events = utledTidslinje(ANSATT_MAP.ada, synlig);
    expect(events.find((e) => e.id === "dm2-vurdering")).toMatchObject({
      dato: null,
      status: "forventet",
      kilde: "forventet",
    });
    expect(events.some((e) => e.id === "dm2-innkalling")).toBe(false);
    expect(utledAktueltNa(ANSATT_MAP.ada, synlig).hendelseId).toBe("dm1");
  });

  it("gjør ikke en passert innkalling til gjennomført møte", () => {
    const ansatt = {
      ...ANSATT_MAP.liv,
      motebehov: {
        besvart: true,
        besvartDato: datoOm(-30),
        innkallingDato: datoOm(-2),
      },
    };
    const event = utledTidslinje(ansatt, synlig).find(
      (e) => e.id === "dm2-innkalling",
    );
    expect(event).toMatchObject({ status: "planlagt", kilde: "kjent" });
    if (!event)
      throw new Error("Forventet den kjente innkallingen i tidslinjen");
    expect(erFortid(event)).toBe(true);
    expect(utledAktueltNa(ansatt, synlig).hendelseId).toBe("maksdato");
  });

  it("viser bare planhendelser når planen er kjent i Navs løsning", () => {
    const ansatt = {
      ...ANSATT_MAP.kai,
      oppfolgingsplan: {
        ...ANSATT_MAP.kai.oppfolgingsplan,
        evalueresDato: datoOm(1),
      },
    };
    expect(
      utledTidslinje(ansatt, synlig).some(
        (e) => e.id === "plan" || e.id === "plan-evaluering",
      ),
    ).toBe(false);
  });

  it("endrer ikke nye dokumenter når DM1-påminnelsen skjules", () => {
    const kai = ANSATT_MAP.kai;
    expect(kai.nyeDokumenter).toEqual({ sykmeldinger: 1, beskjeder: 1 });
    utledAktueltNa(kai, skjult);
    expect(kai.nyeDokumenter).toEqual({ sykmeldinger: 1, beskjeder: 1 });
    expect(ANSATT_MAP.liv.nyeDokumenter).toEqual({ dialogmoter: 1 });
  });

  it("holder 25 separate forløp med både tidlig og sen oppfølging", () => {
    expect(ALLE_ANSATTE).toHaveLength(25);
    expect(new Set(ALLE_ANSATTE.map((ansatt) => ansatt.id)).size).toBe(25);
    for (const ansatt of ALLE_ANSATTE) {
      expect(ansatt.antallSykmeldinger).toBe(ansatt.perioder.length);
      expect(
        utledTidslinje(ansatt, ansatt.dm1Start).find((e) => e.id === "dm1")
          ?.status,
      ).toBe("ukjent");
    }
    expect(utledAktueltNa(ANSATT_MAP["ansatt-7"], synlig).kategori).toBe(
      "kommende",
    );
    expect(utledAktueltNa(ANSATT_MAP["ansatt-10"], synlig).hendelseId).toBe(
      "motebehov",
    );
  });
});
