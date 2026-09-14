import { addDays, addWeeks, formatISO, subDays, subWeeks } from "date-fns";
import type { Ansatt, Scenario } from "../types";

/**
 * Datoene beregnes relativt til dagen prototypen kjøres, slik at scenarioene
 * («fem uker sykmeldt», «møte om fem dager») alltid stemmer uansett når vi
 * demonstrerer. Dette er pedagogiske scenarier, ikke en beregning av juridiske
 * frister.
 */
const iDag = new Date();

const iso = (date: Date): string => formatISO(date, { representation: "date" });

const ukerSiden = (uker: number): string => iso(subWeeks(iDag, uker));
const dagerSiden = (dager: number): string => iso(subDays(iDag, dager));
const ukerFram = (uker: number): string => iso(addWeeks(iDag, uker));
const dagerFram = (dager: number): string => iso(addDays(iDag, dager));

const ORG_STOR = { orgnavn: "Nordvik Verksted AS", orgnummer: "998877665" };
const ORG_LITEN = { orgnavn: "Nordvik Logistikk AS", orgnummer: "998877112" };

/**
 * Seks fiktive ansatte som finnes samtidig. Variant C viser dem i samme
 * oversikt; A og B viser én av dem i detalj.
 */
export const ANSATTE: Ansatt[] = [
  {
    id: "ada",
    navn: "Ada Lyng",
    fnrMaskert: "01019• •••••",
    ...ORG_STOR,
    forlopStart: ukerSiden(5),
    perioder: [
      {
        fom: ukerSiden(5),
        tom: ukerFram(3),
        grad: 100,
        erForlengelse: false,
      },
    ],
    oppfolgingsplan: {
      status: "delt",
      sistEndret: ukerSiden(3),
    },
    dm1Start: { type: "ukjent" },
    dm1Relevans: "hovedregel",
    antallSoknader: 1,
    antallSykmeldinger: 1,
    situasjon: "Helt sykmeldt. Oppfølgingsplan er laget og delt med Nav.",
  },
  {
    id: "emil",
    navn: "Emil Strand",
    fnrMaskert: "12038• •••••",
    ...ORG_STOR,
    forlopStart: ukerSiden(5),
    perioder: [
      {
        fom: ukerSiden(5),
        tom: ukerFram(4),
        grad: 50,
        erForlengelse: false,
      },
    ],
    oppfolgingsplan: {
      status: "delt",
      sistEndret: ukerSiden(2),
      evalueresDato: dagerFram(9),
    },
    dm1Start: { type: "ukjent" },
    dm1Relevans: "vurderes-gradert",
    antallSoknader: 1,
    antallSykmeldinger: 1,
    situasjon:
      "50 % sykmeldt og delvis i jobb. Dere har allerede prøvd tilpassede oppgaver.",
  },
  {
    id: "noor",
    navn: "Noor Hagen",
    fnrMaskert: "23057• •••••",
    ...ORG_LITEN,
    forlopStart: ukerSiden(5),
    perioder: [
      {
        fom: ukerSiden(5),
        tom: dagerFram(6),
        grad: 100,
        erForlengelse: false,
      },
    ],
    oppfolgingsplan: {
      status: "under-arbeid",
      sistEndret: ukerSiden(1),
    },
    dm1Start: { type: "ukjent" },
    dm1Relevans: "hovedregel",
    antallSoknader: 1,
    antallSykmeldinger: 1,
    situasjon:
      "Helt sykmeldt, men ventet tilbake i full stilling om kort tid uten behov for tilrettelegging.",
  },
  {
    id: "jonas",
    navn: "Jonas Five",
    fnrMaskert: "04116• •••••",
    ...ORG_STOR,
    forlopStart: ukerSiden(24),
    perioder: [
      {
        fom: ukerSiden(24),
        tom: ukerSiden(12),
        grad: 100,
        erForlengelse: false,
      },
      {
        fom: ukerSiden(12),
        tom: ukerFram(2),
        grad: 60,
        erForlengelse: true,
      },
    ],
    oppfolgingsplan: {
      status: "delt",
      sistEndret: ukerSiden(6),
    },
    dm1Start: {
      type: "gjennomfort",
      motedato: ukerSiden(18),
      registrertDato: ukerSiden(18),
    },
    dm1Relevans: "passert-fase",
    motebehov: {
      besvart: true,
      besvartDato: dagerSiden(11),
      innkallingDato: null,
    },
    sykepenger: {
      maksdato: ukerFram(28),
      gjenstaendeDager: 140,
      erAnslag: true,
    },
    antallSoknader: 5,
    antallSykmeldinger: 2,
    situasjon:
      "Langt forløp, nå 60 % sykmeldt. Du har svart på Navs spørsmål om behov for møte.",
  },
  {
    id: "liv",
    navn: "Liv Bakken",
    fnrMaskert: "17098• •••••",
    ...ORG_STOR,
    forlopStart: ukerSiden(41),
    perioder: [
      {
        fom: ukerSiden(41),
        tom: ukerSiden(20),
        grad: 100,
        erForlengelse: false,
      },
      {
        fom: ukerSiden(20),
        tom: ukerFram(3),
        grad: 80,
        erForlengelse: true,
      },
    ],
    oppfolgingsplan: {
      status: "delt",
      sistEndret: ukerSiden(9),
    },
    dm1Start: {
      type: "gjennomfort",
      motedato: ukerSiden(35),
      registrertDato: ukerSiden(35),
    },
    dm1Relevans: "passert-fase",
    motebehov: {
      besvart: true,
      besvartDato: ukerSiden(4),
      innkallingDato: dagerFram(8),
    },
    sykepenger: {
      maksdato: ukerFram(11),
      gjenstaendeDager: 53,
      erAnslag: false,
    },
    antallSoknader: 9,
    antallSykmeldinger: 3,
    situasjon:
      "Sent i forløpet. Nav har kalt inn til dialogmøte 2, og maksdato nærmer seg.",
  },
  {
    id: "kai",
    navn: "Kai Rud",
    fnrMaskert: "29074• •••••",
    ...ORG_LITEN,
    forlopStart: ukerSiden(9),
    perioder: [
      {
        fom: ukerSiden(9),
        tom: dagerSiden(4),
        grad: 100,
        erForlengelse: false,
      },
      {
        fom: dagerSiden(3),
        tom: ukerFram(4),
        grad: 100,
        erForlengelse: true,
      },
    ],
    oppfolgingsplan: {
      status: "ingen-i-nav",
      sistEndret: null,
    },
    dm1Start: { type: "ukjent" },
    dm1Relevans: "hovedregel",
    antallSoknader: 2,
    antallSykmeldinger: 2,
    situasjon:
      "Pågående forløp med ny sykmelding. Dere bruker eget system til oppfølgingsplanen.",
  },
];

export const ANSATT_MAP: Record<string, Ansatt> = Object.fromEntries(
  ANSATTE.map((ansatt) => [ansatt.id, ansatt]),
);

/**
 * Scenarioene fra prototypebriefet. Scenario 1–3 er samme person med ulik
 * DM1-status, slik at vi kan se hvordan flaten endrer seg.
 */
export const SCENARIER: Scenario[] = [
  {
    id: "for-dm1",
    nummer: 1,
    navn: "Før dialogmøte 1 — Ada",
    fokusAnsattId: "ada",
    dm1Override: { type: "ukjent" },
    laeringspoeng:
      "Leder finner forberedelse og kan planlegge eller oppgi status. Ingen påstand om at møtet er forsømt.",
  },
  {
    id: "planlagt",
    nummer: 2,
    navn: "Møte planlagt — Ada",
    fokusAnsattId: "ada",
    dm1Override: {
      type: "planlagt",
      motedato: dagerFram(5),
      registrertDato: dagerSiden(2),
    },
    laeringspoeng:
      "Forberedelse og tidspunkt får vekt. Møtet framstår ikke som gjennomført.",
  },
  {
    id: "gjennomfort",
    nummer: 3,
    navn: "Møte gjennomført — Ada",
    fokusAnsattId: "ada",
    dm1Override: {
      type: "gjennomfort",
      motedato: dagerSiden(1),
      registrertDato: iso(iDag),
    },
    laeringspoeng:
      "Møtet flyttes til historikk. Konkret videre oppfølging og plan blir neste handling.",
  },
  {
    id: "gjennomfort-uten-dato",
    nummer: 3,
    navn: "Gjennomført uten møtedato — Ada",
    fokusAnsattId: "ada",
    dm1Override: {
      type: "gjennomfort",
      motedato: null,
      registrertDato: iso(iDag),
    },
    laeringspoeng:
      "Uten møtedato kan registreringen ikke vise når møtet fant sted. Registreringsdato er ikke møtedato.",
  },
  {
    id: "gradert",
    nummer: 4,
    navn: "Gradert forløp — Emil",
    fokusAnsattId: "emil",
    laeringspoeng:
      "Behovet for dialogmøte 1 vurderes. Gradering gir verken automatisk fritak eller et ubetinget krav.",
  },
  {
    id: "unodvendig",
    nummer: 5,
    navn: "Vurdert unødvendig — Noor",
    fokusAnsattId: "noor",
    dm1Override: {
      type: "vurdert-unodvendig",
      registrertDato: dagerSiden(1),
    },
    laeringspoeng:
      "Lederens vurdering vises for seg selv og kan endres. Den teller ikke som gjennomført møte.",
  },
  {
    id: "senere-oppfolging",
    nummer: 6,
    navn: "Senere oppfølging — Jonas",
    fokusAnsattId: "jonas",
    laeringspoeng:
      "Besvart møtebehov, kommende stoppunkt og faktisk møteavtale er tre ulike ting.",
  },
  {
    id: "mot-slutten",
    nummer: 7,
    navn: "Mot slutten av forløpet — Liv",
    fokusAnsattId: "liv",
    laeringspoeng:
      "Sen oppfølging får riktig prioritet. Gamle dialogmøte 1-punkter dominerer ikke.",
  },
  {
    id: "ufullstendig",
    nummer: 8,
    navn: "Ufullstendige opplysninger — Kai",
    fokusAnsattId: "kai",
    laeringspoeng:
      "Forløpet fortsetter selv om en ny sykmelding er kommet inn. Ukjent plan omtales nøkternt.",
  },
];

export const STANDARD_SCENARIO = SCENARIER[0].id;
