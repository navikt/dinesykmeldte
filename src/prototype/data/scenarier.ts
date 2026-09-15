import { addDays, addWeeks, formatISO, subDays, subWeeks } from "date-fns";
import type { Ansatt } from "../types";

/**
 * Datoene beregnes relativt til dagen prototypen kjøres, slik at scenarioene
 * («fem uker sykmeldt», «frist om to uker») alltid stemmer uansett når vi
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
 * Grunnutvalget brukes i alle konsepter, med flere ansatte tilgjengelig for
 * å undersøke hvordan oversikten fungerer når listen blir lang.
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
    dm1Start: { type: "synlig" },
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
    },
    dm1Start: { type: "synlig" },
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
    dm1Start: { type: "skjult" },
    dm1Relevans: "hovedregel",
    antallSoknader: 1,
    antallSykmeldinger: 1,
    situasjon:
      "Helt sykmeldt. Påminnelsen om dialogmøte 1 er skjult i denne demoøkten.",
  },
  {
    id: "jonas",
    navn: "Jonas Five",
    fnrMaskert: "04116• •••••",
    ...ORG_STOR,
    forlopStart: ukerSiden(6),
    perioder: [
      {
        fom: ukerSiden(6),
        tom: ukerFram(2),
        grad: 100,
        erForlengelse: false,
      },
    ],
    oppfolgingsplan: {
      status: "delt",
      sistEndret: ukerSiden(2),
    },
    dm1Start: { type: "synlig" },
    dm1Relevans: "hovedregel",
    antallSoknader: 1,
    antallSykmeldinger: 1,
    situasjon: "Helt sykmeldt i seks uker. Oppfølgingsplanen er delt med Nav.",
  },
  {
    id: "liv",
    navn: "Liv Bakken",
    fnrMaskert: "17098• •••••",
    ...ORG_STOR,
    forlopStart: ukerSiden(2),
    perioder: [
      {
        fom: ukerSiden(2),
        tom: ukerFram(6),
        grad: 100,
        erForlengelse: false,
      },
    ],
    oppfolgingsplan: {
      status: "under-arbeid",
      sistEndret: dagerSiden(2),
    },
    dm1Start: { type: "synlig" },
    dm1Relevans: "hovedregel",
    antallSoknader: 0,
    antallSykmeldinger: 1,
    situasjon: "Helt sykmeldt i to uker. Oppfølgingsplanen er under arbeid.",
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
    dm1Start: { type: "synlig" },
    dm1Relevans: "hovedregel",
    antallSoknader: 2,
    antallSykmeldinger: 2,
    situasjon:
      "Pågående forløp med ny sykmelding. Dere bruker eget system til oppfølgingsplanen.",
  },
];

const FLERE_NAVN = [
  "Sofia Berg",
  "Henrik Dahl",
  "Iben Lund",
  "Amir Solheim",
  "Maja Viken",
  "Oskar Aune",
  "Lea Moen",
  "Isak Holt",
  "Sara Engen",
  "Elias Vik",
  "Nora Eide",
  "Adam Foss",
  "Ingrid Lie",
  "Mikkel Ro",
  "Selma Skog",
  "Aksel Lien",
  "Frida Dale",
  "Yusuf Sand",
  "Tuva Sæther",
];

/** Samme variasjon i tidlig oppfølging, med egne fiktive identiteter. */
export const ALLE_ANSATTE: Ansatt[] = [
  ...ANSATTE,
  ...FLERE_NAVN.map((navn, index): Ansatt => {
    const mal = ANSATTE[index % ANSATTE.length];
    const ansatt: Ansatt = {
      ...mal,
      id: `ansatt-${index + 7}`,
      navn,
      fnrMaskert: `•••••• •••${String(index + 7).padStart(2, "0")}`,
      perioder: mal.perioder.map((periode) => ({ ...periode })),
      oppfolgingsplan: { ...mal.oppfolgingsplan },
      dm1Start: { ...mal.dm1Start },
      motebehov: mal.motebehov ? { ...mal.motebehov } : undefined,
      sykepenger: mal.sykepenger ? { ...mal.sykepenger } : undefined,
      antallSykmeldinger: mal.perioder.length,
    };
    return ansatt;
  }),
];

export const ANSATT_MAP: Record<string, Ansatt> = Object.fromEntries(
  ALLE_ANSATTE.map((ansatt) => [ansatt.id, ansatt]),
);
