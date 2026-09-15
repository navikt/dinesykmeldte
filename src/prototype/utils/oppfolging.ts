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
const PLAN_URL = "https://demo.ekstern.dev.nav.no/syk/oppfolgingsplan/123";
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

/** Forenklet beregning for de fiktive, sammenhengende forløpene i demoen. */
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

/** Disse tekstene beskriver bare visningen, aldri møtets status. */
export function dm1StatusTekst(status: Dm1Status): string {
  return status.type === "skjult"
    ? "Påminnelsen er skjult"
    : "Påminnelse om dialogmøte 1";
}

export function dm1StatusEtikett(status: Dm1Status): string {
  return status.type === "skjult" ? "Påminnelse skjult" : "Dialogmøte 1";
}

const kategoriVedDato = (dato: string): AktueltNa["kategori"] =>
  dagerTil(dato) <= 14 ? "na" : "kommende";

/**
 * Forenklet demoprioritering: aktuelle handlinger først, så nærmeste dato.
 * Alle samtidige handlinger beholdes. En forventet milepæl blir ikke en avtale,
 * og lokal skjuling av DM1 påvirker verken andre tjenester eller dokumenter.
 */
export function utledAktuelleHendelser(
  ansatt: Ansatt,
  dm1: Dm1Status,
): AktueltNa[] {
  const aktuelle: AktueltNa[] = [];
  const innkalling = ansatt.motebehov?.innkallingDato;
  if (innkalling && dagerTil(innkalling) >= 0) {
    aktuelle.push({
      tittel: "Dialogmøte 2 med Nav",
      beskrivelse: `Nav har kalt inn til møte ${formatDato(innkalling)}. Se tidspunkt, deltakere og forberedelser i innkallingen.`,
      begrunnelse: "Innkalling fra Nav",
      handling: { id: "se-innkalling", tekst: "Se innkallingen" },
      tempo: dagerTil(innkalling) <= 2 ? "tidskritisk" : "aktuelt",
      fristDato: innkalling,
      datoEtikett: "Møtedato",
      kategori: kategoriVedDato(innkalling),
      hendelseId: "dm2-innkalling",
    });
  }
  if (ansatt.motebehov && !ansatt.motebehov.besvart && !innkalling) {
    aktuelle.push({
      tittel: "Behov for dialogmøte med Nav",
      beskrivelse:
        "Nav har bedt om din vurdering av om dere trenger et møte. Snakk gjerne med den ansatte før du svarer.",
      begrunnelse: "Spørsmål fra Nav",
      handling: { id: "svar-motebehov", tekst: "Svar om møtebehov" },
      tempo: "aktuelt",
      fristDato: null,
      kategori: "na",
      hendelseId: "motebehov",
    });
  }

  const evaluering = ansatt.oppfolgingsplan.evalueresDato;
  if (evaluering && ansatt.oppfolgingsplan.status !== "ingen-i-nav") {
    aktuelle.push({
      tittel: "Avtalt oppfølging i planen",
      beskrivelse: `Oppfølgingsplanen har en avtale om oppfølging ${formatDato(evaluering)}. Se hva dere har avtalt i planen.`,
      begrunnelse: "Fra oppfølgingsplanen",
      handling: { id: "ga-til-plan", tekst: "Åpne oppfølgingsplanen" },
      tempo: "aktuelt",
      fristDato: evaluering,
      datoEtikett: "Avtalt oppfølging",
      kategori: kategoriVedDato(evaluering),
      hendelseId: "plan-evaluering",
    });
  }

  if (ansatt.sykepenger && ansatt.sykepenger.gjenstaendeDager <= 90) {
    aktuelle.push({
      tittel: "Sykepengeperioden nærmer seg slutten",
      beskrivelse: `Det er ${ansatt.sykepenger.gjenstaendeDager} sykepengedager igjen. Se beregningen og informasjon om videre oppfølging.`,
      begrunnelse: "Opplysninger fra Nav",
      handling: { id: "se-maksdato", tekst: "Se sykepengedagene" },
      tempo: "til-orientering",
      fristDato: ansatt.sykepenger.maksdato,
      datoEtikett: "Maksdato",
      kategori: "na",
      hendelseId: "maksdato",
    });
  }

  if (dm1.type === "synlig" && ansatt.dm1Relevans !== "passert-fase") {
    if (erGradert(ansatt)) {
      aktuelle.push({
        tittel: "Dialogmøte 1",
        beskrivelse:
          "Ved gradert sykmelding skal du som arbeidsgiver holde dialogmøte 1 når du, den ansatte eller sykmelder mener det er hensiktsmessig.",
        begrunnelse: "Gradert sykmelding",
        handling: {
          id: "forbered-dm1",
          tekst: "Vurder behovet og forbered møtet",
        },
        tempo: "aktuelt",
        fristDato: null,
        kategori: "na",
        hendelseId: "dm1",
      });
    } else {
      const frist = dm1FristDato(ansatt);
      aktuelle.push({
        tittel: "Dialogmøte 1",
        beskrivelse: `Som arbeidsgiver skal du holde dialogmøte 1 senest ${formatDato(frist)} (innen sju uker), med mindre møtet er åpenbart unødvendig.`,
        begrunnelse:
          dagerTil(frist) < 0
            ? "Nav vet ikke om møtet er gjennomført"
            : "Arbeidsgivers ansvar innen sju uker",
        handling: { id: "forbered-dm1", tekst: "Forbered møtet" },
        tempo: "aktuelt",
        fristDato: frist,
        datoEtikett: "Frist",
        kategori: kategoriVedDato(frist),
        hendelseId: "dm1",
      });
    }
  }

  const rekkefolge = (hendelse: AktueltNa): number => {
    if (hendelse.hendelseId === "motebehov") return -1;
    return hendelse.fristDato ? Math.max(0, dagerTil(hendelse.fristDato)) : 14;
  };
  return aktuelle.sort((a, b) => {
    if (a.kategori !== b.kategori) return a.kategori === "na" ? -1 : 1;
    return rekkefolge(a) - rekkefolge(b);
  });
}

/** Første handling for kompakte visninger. Resten er tilgjengelige i listen. */
export function utledAktueltNa(ansatt: Ansatt, dm1: Dm1Status): AktueltNa {
  const neste = utledAktuelleHendelser(ansatt, dm1)[0];
  if (neste) return neste;
  if (dm1.type === "skjult" && ansatt.dm1Relevans !== "passert-fase") {
    return {
      tittel: "Dialogmøte 1",
      beskrivelse:
        "Du har skjult påminnelsen. Dette sier ikke om møtet er gjennomført eller om et unntak gjelder.",
      begrunnelse: "Påminnelse skjult",
      handling: { id: "vis-dm1", tekst: "Vis påminnelsen igjen" },
      tempo: "til-orientering",
      fristDato: null,
      kategori: "avventer",
      hendelseId: "dm1",
    };
  }
  const venterPaNav =
    ansatt.motebehov?.besvart && !ansatt.motebehov.innkallingDato;
  return {
    tittel: venterPaNav
      ? "Avventer Navs vurdering"
      : "Ingen kjent oppgave akkurat nå",
    beskrivelse: venterPaNav
      ? "Du har svart om behov for dialogmøte med Nav. Fortsett oppfølgingen dere har avtalt mens Nav vurderer behovet."
      : "Fortsett oppfølgingen dere har avtalt. Du finner kommende punkter og dokumenter i forløpet.",
    begrunnelse: venterPaNav ? "Møtebehov besvart" : "Oppfølgingen fortsetter",
    handling: { id: "ga-til-plan", tekst: "Åpne oppfølgingsplanen" },
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
): string | null => {
  const aktuelt = utledAktueltNa(ansatt, dm1);
  return aktuelt.kategori === "na" ? aktuelt.hendelseId : null;
};

/** Kjent historikk, konkrete avtaler og forventede stoppunkter holdes adskilt. */
export function utledTidslinje(ansatt: Ansatt, dm1: Dm1Status): Hendelse[] {
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

  if (
    ansatt.oppfolgingsplan.status !== "ingen-i-nav" &&
    ansatt.oppfolgingsplan.sistEndret
  ) {
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
      handling: { id: "ga-til-plan", tekst: "Åpne oppfølgingsplanen" },
    });
  }

  const frist = dm1FristDato(ansatt);
  const gradert =
    ansatt.dm1Relevans === "passert-fase"
      ? ansatt.perioder[0].grad < 100
      : erGradert(ansatt);
  hendelser.push({
    id: "dm1",
    tittel: "Dialogmøte 1",
    dato: gradert ? null : frist,
    datoTekst: gradert ? "Vurderes ved behov" : undefined,
    sorteringsdato: frist,
    kilde: "forventet",
    status: "ukjent",
    beskrivelse: gradert
      ? "Arbeidsgiver skal holde møtet når arbeidsgiver, den ansatte eller sykmelder mener det er hensiktsmessig."
      : "Arbeidsgiver skal holde møtet innen sju uker ved helt fravær, med mindre møtet er åpenbart unødvendig.",
    presisering: "Nav vet ikke om møtet er gjennomført.",
    handling:
      dm1.type === "skjult"
        ? { id: "vis-dm1", tekst: "Vis påminnelsen igjen" }
        : { id: "forbered-dm1", tekst: "Forbered møtet" },
  });

  const evaluering = ansatt.oppfolgingsplan.evalueresDato;
  if (evaluering && ansatt.oppfolgingsplan.status !== "ingen-i-nav") {
    hendelser.push({
      id: "plan-evaluering",
      tittel: "Avtalt oppfølging i planen",
      dato: evaluering,
      kilde: "kjent",
      status: "planlagt",
      beskrivelse:
        "Tidspunktet kommer fra oppfølgingsplanen. Oppfølgingen og eventuelle endringer håndteres der.",
      handling: { id: "ga-til-plan", tekst: "Åpne oppfølgingsplanen" },
    });
  }

  if (ansatt.motebehov?.besvart && ansatt.motebehov.besvartDato) {
    hendelser.push({
      id: "motebehov",
      tittel: "Møtebehov besvart",
      dato: ansatt.motebehov.besvartDato,
      kilde: "kjent",
      status: "gjennomfort",
      beskrivelse: "Svaret er sendt til Nav. Dette er ikke en avtale om møte.",
      handling: { id: "svar-motebehov", tekst: "Se møtebehovet" },
    });
  } else if (
    ansatt.motebehov &&
    !ansatt.motebehov.besvart &&
    !ansatt.motebehov.innkallingDato
  ) {
    hendelser.push({
      id: "motebehov",
      tittel: "Nav spør om behov for møte",
      dato: null,
      datoTekst: "Venter på svar fra deg",
      sorteringsdato: formatISO(iDag(), { representation: "date" }),
      kilde: "kjent",
      status: "ukjent",
      beskrivelse:
        "Nav har bedt om din vurdering av behovet for et dialogmøte.",
      handling: { id: "svar-motebehov", tekst: "Svar om møtebehov" },
    });
  }

  const dm2Dato = leggTilUker(ansatt.forlopStart, DM2_UKER);
  if (!ansatt.motebehov?.innkallingDato && dagerTil(dm2Dato) >= 0) {
    hendelser.push({
      id: "dm2-vurdering",
      tittel: "Nav vurderer dialogmøte 2",
      dato: null,
      datoTekst: `Innen uke 26 · ${formatDatoKort(dm2Dato)}`,
      sorteringsdato: dm2Dato,
      kilde: "forventet",
      status: "forventet",
      beskrivelse:
        "Nav skal holde dialogmøte innen 26 uker, med mindre møtet er åpenbart unødvendig. Du får en egen innkalling hvis det blir møte.",
      presisering: "Dette er et stoppunkt i oppfølgingen, ikke en møteavtale.",
    });
  }
  if (ansatt.motebehov?.innkallingDato) {
    hendelser.push({
      id: "dm2-innkalling",
      tittel: "Dialogmøte 2 med Nav",
      dato: ansatt.motebehov.innkallingDato,
      kilde: "kjent",
      status: "planlagt",
      beskrivelse: "Nav har sendt en innkalling med tidspunkt og deltakere.",
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
        ? "Foreløpig anslag fra opplysningene Nav har."
        : "Beregnet fra opplysningene Nav har.",
      handling: { id: "se-maksdato", tekst: "Se sykepengedagene" },
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
