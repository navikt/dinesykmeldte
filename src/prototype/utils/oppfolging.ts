import {
  differenceInCalendarDays,
  formatISO,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import type { AktueltNa, Ansatt, Dm1Status, Hendelse } from "../types";
import { formatDato, formatDatoKort, settPunktum } from "./format";

/**
 * Hovedregelen er dialogmøte 1 innen sju uker ved helt fravær. Ved gradert
 * fravær skal behovet vurderes. Dette er en pedagogisk markør i prototypen —
 * den endelige beregningen må følge eksisterende domeneregler.
 */
const DM1_UKER = 7;
/** Nav vurderer behov for dialogmøte 2 rundt dette tidspunktet. */
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

/**
 * Beskriver lederens DM1-opplysning i vanlig språk. Teksten sier hvem som har
 * sagt hva, slik at registreringen ikke forveksles med en bekreftelse fra Nav.
 */
export function dm1StatusTekst(status: Dm1Status): string {
  switch (status.type) {
    case "ukjent":
      return "Du har ikke lagt inn status for dialogmøte 1";
    case "planlagt":
      return `Planlagt ${formatDato(status.motedato)}`;
    case "gjennomfort":
      return status.motedato
        ? `Du har markert møtet som gjennomført ${formatDato(status.motedato)}`
        : "Du har markert møtet som gjennomført, uten å oppgi møtedato";
    case "vurdert-unodvendig":
      return "Du har vurdert at møtet er åpenbart unødvendig nå";
  }
}

/** Kort merkelapp til lister og tidslinje. */
export function dm1StatusEtikett(status: Dm1Status): string {
  switch (status.type) {
    case "ukjent":
      return "Ingen status lagt inn";
    case "planlagt":
      return "Planlagt";
    case "gjennomfort":
      return "Oppgitt gjennomført";
    case "vurdert-unodvendig":
      return "Vurdert unødvendig";
  }
}

/**
 * Utleder hva som er viktigst for denne ansatte nå.
 *
 * Begrunnelsen er alltid synlig for leder. Vi bruker ingen skjult risikoscore og
 * ingen medisinsk prioritering — bare tidspunkt og hva som faktisk er registrert.
 */
export function utledAktueltNa(ansatt: Ansatt, dm1: Dm1Status): AktueltNa {
  const innkalling = ansatt.motebehov?.innkallingDato;

  // En faktisk innkalling fra Nav har et konkret tidspunkt og går foran.
  if (innkalling && dagerTil(innkalling) >= 0) {
    return {
      tittel: "Møt i dialogmøte 2",
      beskrivelse: `Nav har kalt inn til dialogmøte ${formatDato(innkalling)}. Dette er en avtale med tidspunkt, ikke et varsel om at noe mangler.`,
      begrunnelse: `Innkalling fra Nav med dato om ${dagerTil(innkalling)} dager.`,
      handling: {
        id: "se-innkalling",
        tekst: "Se innkallingen",
        href: `${DIALOGMOTE_URL}/${ansatt.id}`,
      },
      tempo: "tidskritisk",
      fristDato: innkalling,
    };
  }

  // Sent i forløpet veier sykepengeperioden tyngre enn gamle møtepunkter.
  if (ansatt.sykepenger && ansatt.sykepenger.gjenstaendeDager <= 90) {
    return {
      tittel: "Planlegg veien videre før sykepengene tar slutt",
      beskrivelse: `Det er ${ansatt.sykepenger.gjenstaendeDager} sykepengedager igjen, med maksdato ${formatDato(ansatt.sykepenger.maksdato)}. Bruk tiden til å avklare hva som skal skje etterpå.`,
      begrunnelse: `Under 90 sykepengedager igjen i et langt forløp.`,
      handling: {
        id: "evaluer-plan",
        tekst: "Gå gjennom oppfølgingsplanen",
        href: `${PLAN_URL}/${ansatt.id}`,
      },
      tempo: "aktuelt",
      fristDato: ansatt.sykepenger.maksdato,
    };
  }

  if (ansatt.dm1Relevans !== "passert-fase") {
    const frist = dm1FristDato(ansatt);
    const dagerIgjen = dagerTil(frist);

    if (dm1.type === "ukjent") {
      if (erGradert(ansatt)) {
        return {
          tittel: "Vurder om dere trenger dialogmøte 1",
          beskrivelse:
            "Ved gradert sykmelding skal behovet for møte vurderes. At tilpasninger allerede er prøvd, gir verken automatisk fritak eller et ubetinget krav om møte.",
          begrunnelse: `${gjeldendePeriode(ansatt).grad} % sykmeldt i ${ukerISykefravaer(ansatt)} uker. Behovet vurderes.`,
          handling: {
            id: "forbered-dm1",
            tekst: "Les om møtet og ta stilling",
          },
          tempo: "aktuelt",
          fristDato: frist,
        };
      }

      return {
        tittel: "Forbered dialogmøte 1",
        beskrivelse:
          dagerIgjen >= 0
            ? `Ved helt fravær er hovedregelen møte innen sju uker, det vil si innen ${formatDato(frist)}. Du har ikke lagt inn noen status ennå.`
            : `Sju­ukersmerket passerte ${formatDato(frist)}. Vi vet ikke om dere har hatt møtet — du kan legge inn status selv.`,
        begrunnelse:
          dagerIgjen >= 0
            ? `${dagerIgjen} dager til sjuukersmerket, ingen status lagt inn.`
            : "Sjuukersmerket er passert og ingen status er lagt inn.",
        handling: { id: "forbered-dm1", tekst: "Forbered samtalen" },
        // Ukjent status skal aldri framstå som et brudd. Vi løfter først når
        // tidspunktet er rett rundt hjørnet, og demper igjen når det er passert
        // — da vet vi jo ikke om møtet faktisk er holdt.
        tempo: dagerIgjen >= 0 && dagerIgjen <= 7 ? "tidskritisk" : "aktuelt",
        fristDato: frist,
      };
    }

    if (dm1.type === "planlagt") {
      const dagerTilMote = dagerTil(dm1.motedato);

      // En passert planlagt dato gjør ikke møtet gjennomført.
      if (dagerTilMote < 0) {
        return {
          tittel: "Oppdater status for dialogmøte 1",
          beskrivelse: `Du planla møtet ${formatDato(dm1.motedato)}. Vi vet ikke om det ble gjennomført — si fra hvordan det gikk.`,
          begrunnelse: "Planlagt dato er passert uten at status er oppdatert.",
          handling: { id: "endre-dm1", tekst: "Oppdater status" },
          tempo: "tidskritisk",
          fristDato: dm1.motedato,
        };
      }

      return {
        tittel: "Forbered samtalen",
        beskrivelse: `Møtet er planlagt ${formatDato(dm1.motedato)}. Planlegging er ikke gjennomføring — forberedelsen er det som gjør samtalen konkret.`,
        begrunnelse: `Planlagt møte om ${dagerTilMote} ${dagerTilMote === 1 ? "dag" : "dager"}.`,
        handling: { id: "forbered-dm1", tekst: "Forbered samtalen" },
        tempo: dagerTilMote <= 7 ? "tidskritisk" : "aktuelt",
        fristDato: dm1.motedato,
      };
    }

    if (dm1.type === "gjennomfort") {
      const planMangler = ansatt.oppfolgingsplan.status !== "delt";
      return {
        tittel: "Følg opp det dere ble enige om",
        beskrivelse: planMangler
          ? "Møtet er markert som gjennomført. Skriv ned hva dere ble enige om i oppfølgingsplanen, og avtal når dere snakkes igjen."
          : "Møtet er markert som gjennomført. Oppdater oppfølgingsplanen med det dere ble enige om, og avtal når dere snakkes igjen.",
        begrunnelse:
          "Du har oppgitt at møtet er gjennomført. Neste steg er en konkret avtale.",
        handling: {
          id: "avtal-videre",
          tekst: "Avtal videre oppfølging",
        },
        tempo: "aktuelt",
        fristDato: null,
      };
    }

    // vurdert-unodvendig
    return {
      tittel: "Følg med på situasjonen",
      beskrivelse:
        "Du har vurdert at møtet er åpenbart unødvendig nå. Endrer situasjonen seg, for eksempel ved forlenget sykmelding, bør du vurdere på nytt.",
      begrunnelse: "Din vurdering er registrert, og forløpet pågår fortsatt.",
      handling: { id: "endre-dm1", tekst: "Endre vurderingen" },
      tempo: "til-orientering",
      fristDato: null,
    };
  }

  // Senere i forløpet: møtebehov besvart, men ingen innkalling.
  if (ansatt.motebehov?.besvart) {
    return {
      tittel: "Vent på svar om dialogmøte 2",
      beskrivelse:
        "Du har svart på spørsmålet om behov for møte. Nav vurderer om det skal kalles inn. Det finnes ingen møteavtale nå.",
      begrunnelse: "Møtebehov er besvart, og Nav har ikke kalt inn.",
      handling: {
        id: "evaluer-plan",
        tekst: "Gå gjennom oppfølgingsplanen",
        href: `${PLAN_URL}/${ansatt.id}`,
      },
      tempo: "til-orientering",
      fristDato: null,
    };
  }

  return {
    tittel: "Hold oppfølgingen i gang",
    beskrivelse:
      "Det er ingen frister rett rundt hjørnet. Oppfølging og tilrettelegging skjer løpende — du trenger ikke vente på neste stoppunkt for å ta kontakt.",
    begrunnelse: "Ingen kjente stoppunkter de nærmeste ukene.",
    handling: {
      id: "evaluer-plan",
      tekst: "Gå gjennom oppfølgingsplanen",
      href: `${PLAN_URL}/${ansatt.id}`,
    },
    tempo: "til-orientering",
    fristDato: null,
  };
}

/**
 * Bygger forløpet som en kronologisk liste. Hvert punkt er merket med kilde,
 * slik at leder ser forskjell på hva Nav har registrert, hva som bare er et
 * stoppunkt framover, og hva leder selv har lagt inn.
 */
export function utledTidslinje(ansatt: Ansatt, dm1: Dm1Status): Hendelse[] {
  const hendelser: Hendelse[] = [];
  const naa = iDag();

  ansatt.perioder.forEach((periode, index) => {
    hendelser.push({
      id: `sykmelding-${index}`,
      tittel: periode.erForlengelse
        ? `Ny sykmelding i det pågående forløpet — ${periode.grad} %`
        : `Sykmelding mottatt — ${periode.grad} %`,
      dato: periode.fom,
      kilde: "kjent",
      beskrivelse: settPunktum(
        `${periode.grad} % sykmeldt ${formatDatoKort(periode.fom)}–${formatDatoKort(periode.tom)}`,
      ),
      presisering: periode.erForlengelse
        ? "Et nytt sykmeldingsdokument starter ikke et nytt oppfølgingsforløp. Tidsregningen fortsetter fra forløpets start."
        : undefined,
      handling: {
        id: "se-sykmelding",
        tekst: "Se sykmeldingen",
      },
    });
  });

  if (ansatt.oppfolgingsplan.sistEndret) {
    hendelser.push({
      id: "plan",
      tittel:
        ansatt.oppfolgingsplan.status === "delt"
          ? "Oppfølgingsplan delt med Nav"
          : "Oppfølgingsplan påbegynt",
      dato: ansatt.oppfolgingsplan.sistEndret,
      kilde: "kjent",
      beskrivelse:
        ansatt.oppfolgingsplan.status === "delt"
          ? "Planen er laget i Navs løsning og delt."
          : "Planen er startet i Navs løsning, men ikke delt.",
      handling: {
        id: "ga-til-plan",
        tekst: "Åpne oppfølgingsplanen",
        href: `${PLAN_URL}/${ansatt.id}`,
      },
    });
  }

  if (ansatt.dm1Relevans !== "passert-fase") {
    const frist = dm1FristDato(ansatt);

    if (dm1.type === "ukjent") {
      hendelser.push({
        id: "dm1",
        tittel: erGradert(ansatt)
          ? "Dialogmøte 1 — behovet vurderes"
          : "Dialogmøte 1 — hovedregel innen sju uker",
        dato: frist,
        kilde: "forventet",
        beskrivelse: erGradert(ansatt)
          ? "Ved gradert sykmelding skal dere vurdere om møtet er nyttig nå."
          : "Ved helt fravær er hovedregelen møte innen sju uker, med unntak når møtet er åpenbart unødvendig.",
        presisering:
          "Dette er et tidspunkt å forholde seg til, ikke en registrert hendelse. Nav vet ikke om møtet er holdt.",
        handling: { id: "forbered-dm1", tekst: "Forbered samtalen" },
      });
    } else if (dm1.type === "planlagt") {
      hendelser.push({
        id: "dm1",
        tittel: "Dialogmøte 1 — planlagt av deg",
        dato: dm1.motedato,
        kilde: "leder",
        beskrivelse: `Du la inn ${formatDato(dm1.motedato)} som møtetidspunkt. Registrert ${formatDato(dm1.registrertDato)}.`,
        presisering: isBefore(parseISO(dm1.motedato), naa)
          ? "Den planlagte datoen har passert. Møtet regnes ikke som gjennomført før du sier fra."
          : "Planlegging er ikke gjennomføring.",
        handling: { id: "endre-dm1", tekst: "Endre status" },
      });
    } else if (dm1.type === "gjennomfort") {
      hendelser.push({
        id: "dm1",
        tittel: "Dialogmøte 1 — oppgitt gjennomført",
        dato: dm1.motedato,
        datoTekst: dm1.motedato ? undefined : "Møtedato ikke oppgitt",
        kilde: "leder",
        beskrivelse: dm1.motedato
          ? `Du har oppgitt at møtet ble holdt ${formatDato(dm1.motedato)}. Registrert ${formatDato(dm1.registrertDato)}.`
          : `Du har oppgitt at møtet er gjennomført, men ikke når. Registrert ${formatDato(dm1.registrertDato)}.`,
        presisering: dm1.motedato
          ? "Dette er din opplysning, ikke en bekreftelse fra Nav."
          : "Uten møtedato kan registreringen ikke vise når møtet fant sted. Registreringsdato er ikke møtedato.",
        handling: { id: "endre-dm1", tekst: "Endre status" },
      });
    } else {
      hendelser.push({
        id: "dm1",
        tittel: "Dialogmøte 1 — vurdert åpenbart unødvendig",
        dato: dm1.registrertDato,
        kilde: "leder",
        beskrivelse: `Du vurderte ${formatDato(dm1.registrertDato)} at møtet er åpenbart unødvendig nå.`,
        presisering:
          "Dette er din vurdering, ikke et unntaksvedtak fra Nav. Den teller ikke som gjennomført møte.",
        handling: { id: "endre-dm1", tekst: "Endre vurderingen" },
      });
    }
  }

  if (ansatt.oppfolgingsplan.evalueresDato) {
    hendelser.push({
      id: "plan-evaluering",
      tittel: "Avtalt evaluering av oppfølgingsplanen",
      dato: ansatt.oppfolgingsplan.evalueresDato,
      kilde: "leder",
      beskrivelse: "Dere har avtalt å gå gjennom planen på dette tidspunktet.",
      handling: {
        id: "evaluer-plan",
        tekst: "Gå gjennom planen",
        href: `${PLAN_URL}/${ansatt.id}`,
      },
    });
  }

  if (ansatt.motebehov?.besvart && ansatt.motebehov.besvartDato) {
    hendelser.push({
      id: "motebehov",
      tittel: "Du svarte på spørsmål om behov for møte",
      dato: ansatt.motebehov.besvartDato,
      kilde: "kjent",
      beskrivelse: "Svaret er sendt til Nav.",
      presisering: "Et besvart møtebehov er ikke det samme som en møteavtale.",
    });
  }

  const dm2Dato = leggTilUker(ansatt.forlopStart, DM2_UKER);
  const harInnkalling = Boolean(ansatt.motebehov?.innkallingDato);

  if (!harInnkalling && isAfter(parseISO(dm2Dato), naa)) {
    hendelser.push({
      id: "dm2-vurdering",
      tittel: "Nav vurderer behov for dialogmøte 2",
      dato: null,
      datoTekst: `Rundt ${formatDato(dm2Dato)}`,
      kilde: "forventet",
      beskrivelse:
        "Nav vurderer på et tidspunkt i forløpet om det er behov for dialogmøte 2.",
      presisering:
        "Dette er en tidsmarkør. Det betyr ikke at det finnes en konkret møteavtale.",
    });
  }

  if (ansatt.motebehov?.innkallingDato) {
    hendelser.push({
      id: "dm2-innkalling",
      tittel: "Innkalling til dialogmøte 2",
      dato: ansatt.motebehov.innkallingDato,
      kilde: "kjent",
      beskrivelse: `Nav har kalt inn til møte ${formatDato(ansatt.motebehov.innkallingDato)}.`,
      presisering: "Dette er en faktisk avtale med tidspunkt.",
      handling: {
        id: "se-innkalling",
        tekst: "Se innkallingen",
        href: `${DIALOGMOTE_URL}/${ansatt.id}`,
      },
    });
  }

  if (ansatt.sykepenger) {
    hendelser.push({
      id: "maksdato",
      tittel: "Maksdato for sykepenger",
      dato: ansatt.sykepenger.maksdato,
      kilde: "forventet",
      beskrivelse: `${ansatt.sykepenger.gjenstaendeDager} sykepengedager igjen.`,
      presisering: ansatt.sykepenger.erAnslag
        ? "Dette er et anslag som endrer seg hvis sykmeldingsgraden eller opplysningene endres."
        : "Beregnet ut fra opplysningene Nav har nå.",
      handling: { id: "se-maksdato", tekst: "Om sykepengeperioden" },
    });
  }

  return hendelser.sort((a, b) => {
    // Punkter uten presis dato legger seg sist blant de framtidige.
    if (!a.dato && !b.dato) return 0;
    if (!a.dato) return 1;
    if (!b.dato) return -1;
    return a.dato.localeCompare(b.dato);
  });
}

export const erFortid = (hendelse: Hendelse): boolean =>
  hendelse.dato !== null && isBefore(parseISO(hendelse.dato), iDag());

export { DIALOGMOTE_URL, dagerTil, NAV_VEILEDNING_URL, PLAN_URL };
