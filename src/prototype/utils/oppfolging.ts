import {
  differenceInCalendarDays,
  formatISO,
  isBefore,
  parseISO,
} from "date-fns";
import type { AktueltNa, Ansatt, Dm1Status, Hendelse } from "../types";
import { formatDato, formatDatoKort, settPunktum } from "./format";

const DM1_UKER = 7;
const DM2_UKER = 26;
const PLAN_URL = "https://www.nav.no/syk/oppfolgingsplan";
const DIALOGMOTE_URL = "https://www.nav.no/syk/dialogmoter/arbeidsgiver";
const NAV_VEILEDNING_URL =
  "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte";

const iDag = (): Date =>
  parseISO(formatISO(new Date(), { representation: "date" }));
const dagerTil = (dato: string): number =>
  differenceInCalendarDays(parseISO(dato), iDag());
const leggTilUker = (dato: string, uker: number): string => {
  const d = parseISO(dato);
  d.setDate(d.getDate() + uker * 7);
  return formatISO(d, { representation: "date" });
};

export const dm1FristDato = (ansatt: Ansatt): string =>
  leggTilUker(ansatt.forlopStart, DM1_UKER);
export const gjeldendePeriode = (ansatt: Ansatt) =>
  ansatt.perioder[ansatt.perioder.length - 1];
export const erGradert = (ansatt: Ansatt): boolean =>
  gjeldendePeriode(ansatt).grad < 100;
export const ukerISykefravaer = (ansatt: Ansatt): number =>
  Math.max(
    0,
    Math.floor(
      differenceInCalendarDays(iDag(), parseISO(ansatt.forlopStart)) / 7,
    ),
  );

export function dm1StatusTekst(status: Dm1Status): string {
  switch (status.type) {
    case "ukjent":
      return "Ingen status lagt inn her";
    case "planlagt":
      return `Planlagt ${formatDato(status.motedato)}`;
    case "gjennomfort":
      return status.motedato
        ? `Oppgitt gjennomført ${formatDato(status.motedato)}`
        : "Oppgitt gjennomført · møtedato ikke oppgitt";
    case "vurdert-unodvendig":
      return "Vurdert åpenbart unødvendig nå";
  }
}

export function dm1StatusEtikett(status: Dm1Status): string {
  switch (status.type) {
    case "ukjent":
      return "Status ikke oppgitt";
    case "planlagt":
      return "Planlagt";
    case "gjennomfort":
      return "Oppgitt gjennomført";
    case "vurdert-unodvendig":
      return "Vurdert unødvendig";
  }
}

const kategoriVedDato = (dato: string): AktueltNa["kategori"] =>
  dagerTil(dato) <= 14 ? "na" : "kommende";
const avtaltEvaluering = (dato: string): AktueltNa => ({
  tittel:
    dagerTil(dato) < 0
      ? "Følg opp den avtalte evalueringen"
      : "Evaluer tilretteleggingen sammen",
  beskrivelse: `Dere har avtalt en samtale ${formatDato(dato)}. Gå gjennom hva som fungerer, og hva dere vil justere.`,
  begrunnelse: "Avtalt oppfølging",
  handling: { id: "evaluer-plan", tekst: "Se avtalen og planen" },
  tempo: "aktuelt",
  fristDato: dato,
  kategori: kategoriVedDato(dato),
  hendelseId: "plan-evaluering",
});
const avtaltNavMote = (dato: string): AktueltNa => ({
  tittel: "Forbered dialogmøte 2",
  beskrivelse: `Nav har kalt inn til møte ${formatDato(dato)}. Se tidspunkt og forberedelser i innkallingen.`,
  begrunnelse: "Avtalt møte med Nav",
  handling: { id: "se-innkalling", tekst: "Se innkallingen" },
  tempo: dagerTil(dato) >= 0 && dagerTil(dato) <= 2 ? "tidskritisk" : "aktuelt",
  fristDato: dato,
  kategori: kategoriVedDato(dato),
  hendelseId: "dm2-innkalling",
});

/** Avtaler nær i tid får plass foran generelle stoppunkter. Manglende registrering er aldri bevis på forsømt oppfølging. */
export function utledAktueltNa(
  ansatt: Ansatt,
  dm1: Dm1Status,
  avtale?: string | null,
): AktueltNa {
  const evaluering =
    avtale === undefined
      ? (ansatt.oppfolgingsplan.evalueresDato ?? null)
      : avtale;
  const innkalling = ansatt.motebehov?.innkallingDato;
  const kommendeInnkalling =
    innkalling && dagerTil(innkalling) >= 0 ? innkalling : null;
  const kommendeDm1 =
    ansatt.dm1Relevans !== "passert-fase" &&
    dm1.type === "planlagt" &&
    dagerTil(dm1.motedato) >= 0
      ? dm1.motedato
      : null;

  if (
    evaluering &&
    dagerTil(evaluering) <= 14 &&
    (!kommendeInnkalling || evaluering < kommendeInnkalling) &&
    (!kommendeDm1 || evaluering < kommendeDm1)
  ) {
    return avtaltEvaluering(evaluering);
  }
  if (
    kommendeInnkalling &&
    dagerTil(kommendeInnkalling) <= 14 &&
    (!kommendeDm1 || kommendeInnkalling <= kommendeDm1)
  )
    return avtaltNavMote(kommendeInnkalling);

  if (ansatt.sykepenger && ansatt.sykepenger.gjenstaendeDager <= 90) {
    return {
      tittel: "Planlegg veien videre",
      beskrivelse: `Det er ${ansatt.sykepenger.gjenstaendeDager} sykepengedager igjen. Gå gjennom mulighetene sammen før maksdato ${formatDato(ansatt.sykepenger.maksdato)}.`,
      begrunnelse: "Sykepengeperioden nærmer seg slutten",
      handling: { id: "evaluer-plan", tekst: "Gå gjennom oppfølgingsplanen" },
      tempo: "aktuelt",
      fristDato: ansatt.sykepenger.maksdato,
      kategori: "na",
      hendelseId: "maksdato",
    };
  }

  if (ansatt.dm1Relevans !== "passert-fase") {
    const frist = dm1FristDato(ansatt);
    if (dm1.type === "ukjent") {
      if (erGradert(ansatt)) {
        return {
          tittel: "Vurder behovet for dialogmøte 1",
          beskrivelse:
            "Ved gradert sykmelding holdes møtet når du, den ansatte eller sykmelder mener det er behov. Ta vurderingen sammen med den ansatte.",
          begrunnelse: "Gradert sykmelding",
          handling: { id: "forbered-dm1", tekst: "Vurder møtebehovet" },
          tempo: "aktuelt",
          fristDato: null,
          kategori: "na",
          hendelseId: "dm1",
        };
      }
      return {
        tittel:
          dagerTil(frist) < 0
            ? "Avklar videre oppfølging"
            : "Forbered dialogmøte 1",
        beskrivelse:
          dagerTil(frist) < 0
            ? `Sjuukersfristen var ${formatDato(frist)}. Status er ikke lagt inn her. Har dere hatt møtet, kan du oppgi det; ellers kan du forberede samtalen.`
            : `Hovedregelen ved helt fravær er møte innen ${formatDato(frist)}, med unntak når møtet er åpenbart unødvendig.`,
        begrunnelse:
          dagerTil(frist) < 0
            ? "Møtestatus er ikke oppgitt"
            : "Dialogmøte 1 innen sju uker",
        handling: { id: "forbered-dm1", tekst: "Forbered møtet" },
        tempo: "aktuelt",
        fristDato: frist,
        kategori: kategoriVedDato(frist),
        hendelseId: "dm1",
      };
    }
    if (dm1.type === "planlagt") {
      const passert = dagerTil(dm1.motedato) < 0;
      return {
        tittel: passert
          ? "Hvordan gikk dialogmøte 1?"
          : "Forbered det avtalte møtet",
        beskrivelse: passert
          ? `Møtet var planlagt ${formatDato(dm1.motedato)}. Du kan oppdatere status og avtale videre oppfølging.`
          : `Dere møtes ${formatDato(dm1.motedato)}. Forbered hva dere vil prøve av tilrettelegging, og når dere skal evaluere.`,
        begrunnelse: passert
          ? "Planlagt møtedato har passert"
          : "Møtetidspunkt lagt inn av deg",
        handling: {
          id: passert ? "endre-dm1" : "forbered-dm1",
          tekst: passert ? "Oppdater møtestatus" : "Forbered møtet",
        },
        tempo: "aktuelt",
        fristDato: dm1.motedato,
        kategori: kategoriVedDato(dm1.motedato),
        hendelseId: "dm1",
      };
    }
    if (evaluering) return avtaltEvaluering(evaluering);
    if (dm1.type === "gjennomfort") {
      return {
        tittel: "Avtal når dere følger opp igjen",
        beskrivelse:
          "Møtet er oppgitt gjennomført. Samle det dere ble enige om i oppfølgingsplanen, og avtal når dere skal evaluere.",
        begrunnelse: "Dialogmøte 1 er oppgitt gjennomført",
        handling: { id: "avtal-videre", tekst: "Avtal neste samtale" },
        tempo: "aktuelt",
        fristDato: null,
        kategori: "na",
        hendelseId: null,
      };
    }
    return {
      tittel: "Ingen ny oppgave nå",
      beskrivelse:
        "Du har vurdert møtet som åpenbart unødvendig nå. Vurder behovet på nytt hvis situasjonen endrer seg.",
      begrunnelse: "Vurdering lagt inn av deg",
      handling: { id: "endre-dm1", tekst: "Se vurderingen" },
      tempo: "til-orientering",
      fristDato: null,
      kategori: "avventer",
      hendelseId: null,
    };
  }

  if (evaluering) return avtaltEvaluering(evaluering);
  if (kommendeInnkalling) return avtaltNavMote(kommendeInnkalling);
  if (ansatt.motebehov && !ansatt.motebehov.besvart && !innkalling) {
    return {
      tittel: "Svar om behov for dialogmøte 2",
      beskrivelse:
        "Nav ber om din vurdering av om dere trenger et møte. Snakk gjerne med den ansatte før du svarer.",
      begrunnelse: "Spørsmål fra Nav",
      handling: { id: "svar-motebehov", tekst: "Se spørsmålet om møtebehov" },
      tempo: "aktuelt",
      fristDato: null,
      kategori: "na",
      hendelseId: "motebehov",
    };
  }
  return {
    tittel: ansatt.motebehov?.besvart
      ? "Avventer Navs vurdering"
      : "Ingen ny oppgave nå",
    beskrivelse: ansatt.motebehov?.besvart
      ? "Du har svart om behov for dialogmøte 2. Fortsett den avtalte oppfølgingen mens Nav vurderer svaret."
      : "Fortsett oppfølgingen dere har avtalt. Du finner planen og tidligere hendelser i forløpet.",
    begrunnelse: ansatt.motebehov?.besvart
      ? "Møtebehov er besvart"
      : "Ingen kjent oppgave akkurat nå",
    handling: { id: "evaluer-plan", tekst: "Se oppfølgingsplanen" },
    tempo: "til-orientering",
    fristDato: null,
    kategori: "avventer",
    hendelseId: null,
  };
}

export const kategoriForAktuelt = (aktuelt: AktueltNa): AktueltNa["kategori"] =>
  aktuelt.kategori;
export const aktivHendelseId = (
  ansatt: Ansatt,
  dm1: Dm1Status,
  avtale?: string | null,
): string | null => {
  const aktuelt = utledAktueltNa(ansatt, dm1, avtale);
  return aktuelt.kategori === "na" ? aktuelt.hendelseId : null;
};

/** Kilden og statusen beskriver hva som er kjent. Sorteringsdatoen brukes kun til plassering. */
export function utledTidslinje(
  ansatt: Ansatt,
  dm1: Dm1Status,
  avtale?: string | null,
): Hendelse[] {
  const hendelser: Hendelse[] = ansatt.perioder.map((periode, index) => ({
    id: `sykmelding-${index}`,
    tittel: periode.erForlengelse
      ? `Sykmelding forlenget · ${periode.grad} %`
      : `Sykefraværet startet · ${periode.grad} %`,
    dato: periode.fom,
    kilde: "kjent",
    status: "gjennomfort",
    beskrivelse: settPunktum(
      `${periode.grad} % sykmeldt ${formatDatoKort(periode.fom)}–${formatDatoKort(periode.tom)}`,
    ),
    handling: { id: "se-sykmelding", tekst: "Se sykmeldingen" },
  }));
  if (ansatt.oppfolgingsplan.sistEndret) {
    hendelser.push({
      id: "plan",
      tittel:
        ansatt.oppfolgingsplan.status === "delt"
          ? "Oppfølgingsplan delt med Nav"
          : "Oppfølgingsplan påbegynt",
      dato: ansatt.oppfolgingsplan.sistEndret,
      kilde: "kjent",
      status: "gjennomfort",
      beskrivelse:
        ansatt.oppfolgingsplan.status === "delt"
          ? "Planen finnes i Navs løsning."
          : "Planen er under arbeid i Navs løsning.",
      handling: { id: "ga-til-plan", tekst: "Se oppfølgingsplanen" },
    });
  }

  const frist = dm1FristDato(ansatt);
  if (dm1.type === "ukjent") {
    hendelser.push({
      id: "dm1",
      tittel: "Dialogmøte 1",
      dato: erGradert(ansatt) ? null : frist,
      datoTekst: erGradert(ansatt) ? "Vurderes ved behov" : undefined,
      sorteringsdato: frist,
      kilde: "forventet",
      status: "ukjent",
      beskrivelse: erGradert(ansatt)
        ? "Møte ved behov hos arbeidsgiver, den ansatte eller sykmelder."
        : "Hovedregel: møte innen sju uker, med unntak når det er åpenbart unødvendig.",
      presisering: "Møtestatus er ikke lagt inn her.",
      handling: {
        id: "forbered-dm1",
        tekst: erGradert(ansatt) ? "Vurder møtebehovet" : "Forbered møtet",
      },
    });
  } else if (dm1.type === "planlagt") {
    hendelser.push({
      id: "dm1",
      tittel: "Dialogmøte 1",
      dato: dm1.motedato,
      kilde: "leder",
      status: "planlagt",
      beskrivelse: "Møtetidspunkt lagt inn av deg.",
      presisering:
        dagerTil(dm1.motedato) < 0
          ? "Datoen har passert; gjennomføring er ikke oppgitt."
          : undefined,
      handling: { id: "endre-dm1", tekst: "Se eller endre møtestatus" },
    });
  } else if (dm1.type === "gjennomfort") {
    hendelser.push({
      id: "dm1",
      tittel: "Dialogmøte 1",
      dato: dm1.motedato,
      datoTekst: dm1.motedato ? undefined : "Møtedato ikke oppgitt",
      sorteringsdato: dm1.motedato ?? dm1.registrertDato,
      kilde: "leder",
      status: "gjennomfort",
      beskrivelse: "Oppgitt gjennomført av deg.",
      presisering: dm1.motedato
        ? undefined
        : `Registrert ${formatDato(dm1.registrertDato)}. Dette er ikke møtedatoen.`,
      handling: { id: "endre-dm1", tekst: "Se eller endre møtestatus" },
    });
  } else {
    hendelser.push({
      id: "dm1",
      tittel: "Dialogmøte 1 vurdert unødvendig",
      dato: dm1.registrertDato,
      kilde: "leder",
      status: "vurdert",
      beskrivelse: "Du har vurdert møtet som åpenbart unødvendig nå.",
      handling: { id: "endre-dm1", tekst: "Se eller endre vurderingen" },
    });
  }

  const evaluering =
    avtale === undefined
      ? (ansatt.oppfolgingsplan.evalueresDato ?? null)
      : avtale;
  if (evaluering) {
    hendelser.push({
      id: "plan-evaluering",
      tittel: "Evaluering av tilretteleggingen",
      dato: evaluering,
      kilde: "leder",
      status: "planlagt",
      beskrivelse:
        "Avtalt samtale om hva som fungerer, og hva dere vil justere.",
      handling: { id: "evaluer-plan", tekst: "Se avtalen og planen" },
    });
  }
  if (ansatt.motebehov) {
    if (ansatt.motebehov.besvart && ansatt.motebehov.besvartDato) {
      hendelser.push({
        id: "motebehov",
        tittel: "Møtebehov besvart",
        dato: ansatt.motebehov.besvartDato,
        kilde: "kjent",
        status: "gjennomfort",
        beskrivelse: "Svaret er sendt til Nav.",
      });
    } else if (!ansatt.motebehov.besvart && !ansatt.motebehov.innkallingDato) {
      hendelser.push({
        id: "motebehov",
        tittel: "Nav spør om møtebehov",
        dato: null,
        datoTekst: "Venter på svar fra deg",
        sorteringsdato: formatISO(iDag(), { representation: "date" }),
        kilde: "kjent",
        status: "ukjent",
        beskrivelse: "Vurder om dere trenger dialogmøte 2.",
        handling: { id: "svar-motebehov", tekst: "Se spørsmålet om møtebehov" },
      });
    }
  }
  const dm2Dato = leggTilUker(ansatt.forlopStart, DM2_UKER);
  if (!ansatt.motebehov?.innkallingDato && dagerTil(dm2Dato) >= 0) {
    hendelser.push({
      id: "dm2-vurdering",
      tittel: "Nav vurderer dialogmøte 2",
      dato: null,
      datoTekst: `Rundt ${formatDatoKort(dm2Dato)}`,
      sorteringsdato: dm2Dato,
      kilde: "forventet",
      status: "forventet",
      beskrivelse:
        "Forventet stoppunkt. Du får en egen innkalling hvis det blir møte.",
    });
  }
  if (ansatt.motebehov?.innkallingDato) {
    hendelser.push({
      id: "dm2-innkalling",
      tittel: "Dialogmøte 2 med Nav",
      dato: ansatt.motebehov.innkallingDato,
      kilde: "kjent",
      status: "planlagt",
      beskrivelse: "Nav har sendt en innkalling.",
      handling: { id: "se-innkalling", tekst: "Se innkallingen" },
    });
  }
  if (ansatt.sykepenger) {
    hendelser.push({
      id: "maksdato",
      tittel: "Maksdato for sykepenger",
      dato: ansatt.sykepenger.maksdato,
      kilde: "forventet",
      status: "forventet",
      beskrivelse: `${ansatt.sykepenger.gjenstaendeDager} sykepengedager igjen.`,
      presisering: ansatt.sykepenger.erAnslag
        ? "Foreløpig anslag."
        : "Beregnet fra opplysningene Nav har.",
      handling: { id: "se-maksdato", tekst: "Se sykepengeperioden" },
    });
  }
  return hendelser.sort((a, b) =>
    (a.sorteringsdato ?? a.dato ?? "9999").localeCompare(
      b.sorteringsdato ?? b.dato ?? "9999",
    ),
  );
}

/** Tidsplassering, aldri en gjennomføringsstatus. */
export const erFortid = (hendelse: Hendelse): boolean => {
  const dato = hendelse.sorteringsdato ?? hendelse.dato;
  return (
    dato !== null && dato !== undefined && isBefore(parseISO(dato), iDag())
  );
};

export { DIALOGMOTE_URL, dagerTil, NAV_VEILEDNING_URL, PLAN_URL };
