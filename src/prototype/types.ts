/**
 * Prototype for sykefraværsoppfølging — konseptutforsking, ikke produksjonskode.
 * All data er fiktiv og all tilstand lever i minnet.
 */

export type VariantId = "A" | "B" | "C";

/**
 * Lederens egen opplysning om dialogmøte 1.
 *
 * Nav vet i dag ikke om møtet er gjennomført. Dette er derfor en opplysning fra
 * leder, ikke en bekreftelse fra Nav. «Tatt stilling til» brukes bevisst ikke som
 * felles sluttstatus, fordi den skjuler forskjellen mellom planlegging,
 * gjennomføring og en vurdering av unntak.
 */
export type Dm1Status =
  | { type: "ukjent" }
  | { type: "planlagt"; motedato: string; registrertDato: string }
  /** motedato kan mangle — da kan registreringen ikke dokumentere rettidig gjennomføring. */
  | { type: "gjennomfort"; motedato: string | null; registrertDato: string }
  | { type: "vurdert-unodvendig"; registrertDato: string };

export type Dm1StatusType = Dm1Status["type"];

/**
 * Hvor opplysningen kommer fra. Dette skillet er faglig viktig og skal være
 * synlig for leder i alle varianter.
 */
export type Kilde =
  /** Registrert hendelse Nav kjenner til, f.eks. mottatt sykmelding eller delt plan. */
  | "kjent"
  /** Stoppunkt eller frist framover. Ikke en avtale, og ikke noe som har skjedd. */
  | "forventet"
  /** Opplysning leder selv har lagt inn i denne løsningen. */
  | "leder";

export interface Hendelse {
  id: string;
  tittel: string;
  /** ISO-dato. null når tidspunktet ikke er kjent eller ikke er presist. */
  dato: string | null;
  /** Plassering i forløpet når vist dato er upresis eller ukjent. Aldri møtedato. */
  sorteringsdato?: string;
  /** Hva vi vet om hendelsen. En passert dato betyr ikke gjennomført. */
  status: "gjennomfort" | "planlagt" | "ukjent" | "forventet" | "vurdert";
  /** Vises i stedet for dato når tidspunktet er upresist, f.eks. «rundt uke 26». */
  datoTekst?: string;
  kilde: Kilde;
  beskrivelse: string;
  /** Ekstra presisering der en misforståelse er sannsynlig. */
  presisering?: string;
  handling?: Handling;
}

export type HandlingId =
  | "forbered-dm1"
  | "registrer-dm1"
  | "endre-dm1"
  | "ga-til-plan"
  | "evaluer-plan"
  | "svar-motebehov"
  | "se-innkalling"
  | "se-sykmelding"
  | "avtal-videre"
  | "se-maksdato";

export interface Handling {
  id: HandlingId;
  tekst: string;
  /** Ekstern lenke der handlingen hører hjemme i en eksisterende tjeneste. */
  href?: string;
  /** Hvorfor denne handlingen er aktuell nå — vises for leder, ikke skjult logikk. */
  begrunnelse?: string;
}

export interface Sykmeldingsperiode {
  fom: string;
  tom: string;
  /** 100 = helt sykmeldt. */
  grad: number;
  /** Nytt dokument i et forløp som allerede pågår. */
  erForlengelse: boolean;
}

export interface Oppfolgingsplan {
  /** Plan som finnes i Navs løsning. */
  status: "delt" | "under-arbeid" | "ingen-i-nav";
  sistEndret: string | null;
  /** Avtalt tidspunkt for evaluering, når partene har satt et. */
  evalueresDato?: string;
}

export interface Ansatt {
  id: string;
  navn: string;
  /** Fiktivt og maskert. Aldri et gyldig fødselsnummer. */
  fnrMaskert: string;
  orgnavn: string;
  orgnummer: string;
  /** Startdato for det sammenhengende oppfølgingsforløpet, ikke for siste dokument. */
  forlopStart: string;
  perioder: Sykmeldingsperiode[];
  oppfolgingsplan: Oppfolgingsplan;
  /** Startverdi for lederens DM1-opplysning. */
  dm1Start: Dm1Status;
  /** Om dialogmøte 1 i det hele tatt er aktuelt i dette forløpet. */
  dm1Relevans: "hovedregel" | "vurderes-gradert" | "passert-fase";
  motebehov?: {
    besvart: boolean;
    besvartDato: string | null;
    /** Faktisk innkalling fra Nav, som er noe annet enn et stoppunkt. */
    innkallingDato: string | null;
  };
  sykepenger?: {
    maksdato: string;
    gjenstaendeDager: number;
    /** Anslag endrer seg ved endret sykmeldingsgrad eller nye opplysninger. */
    erAnslag: boolean;
  };
  antallSoknader: number;
  antallSykmeldinger: number;
  /** Kort, nøktern situasjonsbeskrivelse. Ingen helseopplysninger. */
  situasjon: string;
}

export interface Scenario {
  id: string;
  nummer: number;
  navn: string;
  /** Hvilken ansatt A og B viser i detalj. */
  fokusAnsattId: string;
  /** Hva scenarioet skal gjøre synlig i prototypetesten. */
  laeringspoeng: string;
  /** Overstyrer ansattens startstatus for dette scenarioet. */
  dm1Override?: Dm1Status;
}

/** Utledet «aktuelt nå» — samme logikk i alle tre varianter. */
export interface AktueltNa {
  tittel: string;
  beskrivelse: string;
  /** Hvorfor dette er løftet fram. Vises for leder, ikke skjult score. */
  begrunnelse: string;
  handling: Handling;
  /** Hvor mye det haster — styrer plassering, ikke et brudd-varsel. */
  tempo: "tidskritisk" | "aktuelt" | "til-orientering";
  /** ISO-dato som gir tempoet, når det finnes. */
  fristDato: string | null;
  /** Skiller en aktuell oppgave fra en fremtidig avtale og ingen oppgave nå. */
  kategori: "na" | "kommende" | "avventer";
  /** Hendelsen oppgaven tilhører, hvis den finnes i tidslinjen. */
  hendelseId: string | null;
}
