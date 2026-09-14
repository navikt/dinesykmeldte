import { addDays, formatISO } from "date-fns";
import { describe, expect, it } from "vitest";
import { ALLE_ANSATTE, ANSATT_MAP } from "../data/scenarier";
import type { Dm1Status } from "../types";
import { aktivHendelseId, utledAktueltNa, utledTidslinje } from "./oppfolging";

const datoOm = (days: number) =>
  formatISO(addDays(new Date(), days), { representation: "date" });
const gjennomfort: Dm1Status = {
  type: "gjennomfort",
  motedato: datoOm(-1),
  registrertDato: datoOm(0),
};

describe("oppfølging uten å gjette på gjennomføring", () => {
  it("lar passert, ukjent DM1 være ukjent og aktuelt, uten hastemerking", () => {
    const ansatt = ANSATT_MAP.kai;
    const dm1 = utledTidslinje(ansatt, ansatt.dm1Start).find(
      (hendelse) => hendelse.id === "dm1",
    );
    expect(dm1?.status).toBe("ukjent");
    expect(aktivHendelseId(ansatt, ansatt.dm1Start)).toBe("dm1");
    expect(utledAktueltNa(ansatt, ansatt.dm1Start).tempo).toBe("aktuelt");
  });

  it("beholder gjennomført møte uten dato i historikken, og lar neste oppgave gjelde oppfølging", () => {
    const status: Dm1Status = { ...gjennomfort, motedato: null };
    const events = utledTidslinje(ANSATT_MAP.ada, status);
    const event = events.find((hendelse) => hendelse.id === "dm1");
    expect(event).toMatchObject({
      status: "gjennomfort",
      dato: null,
      datoTekst: "Møtedato ikke oppgitt",
    });
    expect(event?.presisering).toContain("ikke møtedatoen");
    expect(events.findIndex((hendelse) => hendelse.id === "dm1")).toBeLessThan(
      events.findIndex((hendelse) => hendelse.id === "dm2-vurdering"),
    );
    expect(utledAktueltNa(ANSATT_MAP.ada, status).handling.id).toBe(
      "avtal-videre",
    );
    expect(aktivHendelseId(ANSATT_MAP.ada, status)).toBeNull();
  });

  it("gjør ikke passert planlagt dato til gjennomføring eller en hastesak", () => {
    const status: Dm1Status = {
      type: "planlagt",
      motedato: datoOm(-2),
      registrertDato: datoOm(-7),
    };
    expect(
      utledTidslinje(ANSATT_MAP.ada, status).find((event) => event.id === "dm1")
        ?.status,
    ).toBe("planlagt");
    expect(utledAktueltNa(ANSATT_MAP.ada, status)).toMatchObject({
      handling: { id: "endre-dm1" },
      tempo: "aktuelt",
    });
  });

  it("plasserer et omtrentlig DM2-stoppunkt før senere maksdato, og beholder eldre DM1", () => {
    const ansatt = ANSATT_MAP.jonas;
    const events = utledTidslinje(ansatt, ansatt.dm1Start);
    expect(events.find((event) => event.id === "dm1")?.status).toBe(
      "gjennomfort",
    );
    expect(
      events.findIndex((event) => event.id === "dm2-vurdering"),
    ).toBeLessThan(events.findIndex((event) => event.id === "maksdato"));
    expect(events.find((event) => event.id === "dm2-vurdering")).toMatchObject({
      dato: null,
      status: "forventet",
    });
    expect(aktivHendelseId(ansatt, ansatt.dm1Start)).toBeNull();
  });

  it("gir ikke gradert sykmelding en ubetinget sjukeukersfrist", () => {
    const ansatt = ANSATT_MAP.emil;
    expect(utledAktueltNa(ansatt, ansatt.dm1Start, null)).toMatchObject({
      fristDato: null,
      hendelseId: "dm1",
    });
    expect(
      utledTidslinje(ansatt, ansatt.dm1Start).find(
        (event) => event.id === "dm1",
      ),
    ).toMatchObject({ dato: null, datoTekst: "Vurderes ved behov" });
  });
});

describe("neste handling følger de konkrete avtalene", () => {
  it.each([
    { dm1Om: 5, evalueringOm: 9, dm2Om: 12, forventet: "dm1" },
    { dm1Om: 9, evalueringOm: 5, dm2Om: 12, forventet: "plan-evaluering" },
    { dm1Om: 9, evalueringOm: 12, dm2Om: 5, forventet: "dm2-innkalling" },
    { dm1Om: 5, evalueringOm: 5, dm2Om: 12, forventet: "dm1" },
  ])("løfter nærmeste konkrete avtale: $forventet", ({
    dm1Om,
    evalueringOm,
    dm2Om,
    forventet,
  }) => {
    const ansatt = {
      ...ANSATT_MAP.ada,
      motebehov: {
        besvart: true,
        besvartDato: datoOm(-1),
        innkallingDato: datoOm(dm2Om),
      },
    };
    const status: Dm1Status = {
      type: "planlagt",
      motedato: datoOm(dm1Om),
      registrertDato: datoOm(-1),
    };
    expect(
      utledAktueltNa(ansatt, status, datoOm(evalueringOm)).hendelseId,
    ).toBe(forventet);
  });

  it("løfter Emils allerede avtalte evaluering", () => {
    const ansatt = ANSATT_MAP.emil;
    expect(utledAktueltNa(ansatt, ansatt.dm1Start)).toMatchObject({
      hendelseId: "plan-evaluering",
      fristDato: ansatt.oppfolgingsplan.evalueresDato,
      kategori: "na",
    });
  });

  it("erstatter behov for å avtale med en fremtidig avtale i oppgave og tidslinje", () => {
    const dato = datoOm(21);
    const ansatt = ANSATT_MAP.ada;
    expect(utledAktueltNa(ansatt, gjennomfort, dato)).toMatchObject({
      kategori: "kommende",
      hendelseId: "plan-evaluering",
      fristDato: dato,
    });
    expect(
      utledTidslinje(ansatt, gjennomfort, dato).find(
        (event) => event.id === "plan-evaluering",
      ),
    ).toMatchObject({ dato, status: "planlagt" });
    expect(aktivHendelseId(ansatt, gjennomfort, dato)).toBeNull();
    expect(utledAktueltNa(ansatt, gjennomfort, datoOm(7)).kategori).toBe("na");
  });

  it("lar eksplisitt sletting fjerne en avtale fra både tidslinje og oppgave", () => {
    const ansatt = ANSATT_MAP.emil;
    expect(
      utledTidslinje(ansatt, ansatt.dm1Start, null).some(
        (event) => event.id === "plan-evaluering",
      ),
    ).toBe(false);
    expect(utledAktueltNa(ansatt, ansatt.dm1Start, null).hendelseId).toBe(
      "dm1",
    );
  });

  it("skiller ingen ny oppgave fra fremtidig avtale", () => {
    const ansatt = ANSATT_MAP.noor;
    expect(utledAktueltNa(ansatt, ansatt.dm1Start).kategori).toBe("avventer");
    expect(utledAktueltNa(ansatt, ansatt.dm1Start, datoOm(24)).kategori).toBe(
      "kommende",
    );
  });

  it("holder alle 25 identiteter og dokumentantall konsistente uten ekte URL-er med fiktive id-er", () => {
    expect(ALLE_ANSATTE).toHaveLength(25);
    expect(new Set(ALLE_ANSATTE.map((ansatt) => ansatt.id)).size).toBe(25);
    for (const ansatt of ALLE_ANSATTE) {
      expect(ansatt.antallSykmeldinger).toBe(ansatt.perioder.length);
      expect(
        utledAktueltNa(ansatt, ansatt.dm1Start).handling.href,
      ).toBeUndefined();
      for (const hendelse of utledTidslinje(ansatt, ansatt.dm1Start))
        expect(hendelse.handling?.href).toBeUndefined();
    }
  });
});
