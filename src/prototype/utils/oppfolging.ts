import {
  differenceInCalendarDays,
  formatISO,
  isBefore,
  parseISO,
} from "date-fns";
import type { AktueltNa, Ansatt, Dm1Status, Hendelse } from "../types";
import { formatDato, formatDatoKort, settPunktum } from "./format";

const DM1_UKER = 7;
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

/** Veiledning om DM1. Nav utleder verken møtegjennomføring eller lovbrudd. */
export function utledAktueltNa(ansatt: Ansatt, dm1: Dm1Status): AktueltNa {
  if (dm1.type === "skjult") {
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

  if (erGradert(ansatt)) {
    return {
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
    };
  }

  const frist = dm1FristDato(ansatt);
  return {
    tittel: "Dialogmøte 1",
    beskrivelse: `Som arbeidsgiver skal du holde dialogmøte 1 senest ${formatDato(frist)} (innen sju uker), med mindre møtet er åpenbart unødvendig.`,
    begrunnelse:
      dagerTil(frist) < 0
        ? "Nav vet ikke om møtet er gjennomført"
        : "Arbeidsgivers ansvar innen sju uker",
    handling: { id: "forbered-dm1", tekst: "Forbered møtet" },
    tempo: "aktuelt",
    fristDato: frist,
    kategori: dagerTil(frist) <= 14 ? "na" : "kommende",
    hendelseId: "dm1",
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

/** Kjent sykmelding og plan gir kontekst. DM1-punktet er en frist, ikke en avtale. */
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
  const gradert = erGradert(ansatt);
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
