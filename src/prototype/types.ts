/**
 * Prototype for sykefraværsoppfølging — konseptutforsking, ikke produksjonskode.
 * All data er fiktiv og all tilstand lever i minnet.
 */

export type VariantId = "A" | "B" | "C";

/**
 * Lokal visningsinnstilling for påminnelsen om dialogmøte 1.
 * Dette registrerer verken gjennomføring, møtedato eller en vurdering av unntak.
 * Valget lever bare i minnet og nullstilles når demoen lastes på nytt.
 */
export type Dm1Status = { type: "synlig" } | { type: "skjult" };

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
  | "skjul-dm1"
  | "vis-dm1"
  | "ga-til-plan"
  | "svar-motebehov"
  | "se-innkalling"
  | "se-sykmelding"
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
  /** Lesbar opplysning fra oppfølgingsplanen. Datoen endres bare i plantjenesten. */
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
  /** Startverdi for den lokale påminnelsen om dialogmøte 1. */
  dm1Start: Dm1Status;
  /** Prioritering i demoen. Passert fase sier ingenting om møtet er gjennomført. */
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
  /** Nye dokumenter i eksisterende tjenester, uavhengig av lokale påminnelser. */
  nyeDokumenter?: {
    sykmeldinger?: number;
    beskjeder?: number;
    dialogmoter?: number;
    soknader?: number;
    oppfolgingsplan?: number;
  };
  antallSoknader: number;
  antallSykmeldinger: number;
  /** Kort, nøktern situasjonsbeskrivelse. Ingen helseopplysninger. */
  situasjon: string;
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
  /** Hva datoen betyr. Et avtalt tidspunkt er ikke en frist. */
  datoEtikett?: "Frist" | "Møtedato" | "Avtalt oppfølging" | "Maksdato";
  /** Aktuell handling, fremtidig handling eller ingen kjent oppgave nå. */
  kategori: "na" | "kommende" | "avventer";
  /** Hendelsen oppgaven tilhører, hvis den finnes i tidslinjen. */
  hendelseId: string | null;
}
