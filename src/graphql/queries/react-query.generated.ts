/* eslint-disable */
import { useQuery, UseQueryOptions } from 'react-query';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
    return async (): Promise<TData> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/graphql` as string, {
            method: 'POST',
            body: JSON.stringify({ query, variables }),
        });

        const json = await res.json();

        if (json.errors) {
            const { message } = json.errors[0];

            throw new Error(message);
        }

        return json.data;
    };
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    LocalDate: any;
    LocalDateTime: any;
};

export type Adresse = {
    __typename?: 'Adresse';
    gate?: Maybe<Scalars['String']>;
    kommune?: Maybe<Scalars['String']>;
    land?: Maybe<Scalars['String']>;
    postboks?: Maybe<Scalars['String']>;
    postnummer?: Maybe<Scalars['Int']>;
};

export type AktivitetIkkeMulig = {
    __typename?: 'AktivitetIkkeMulig';
    arbeidsrelatertArsak?: Maybe<ArbeidsrelatertArsak>;
    medisinskArsak?: Maybe<MedisinskArsak>;
};

export enum AnnenFraverGrunn {
    Abort = 'ABORT',
    ArbeidsrettetTiltak = 'ARBEIDSRETTET_TILTAK',
    BehandlingForhindrerArbeid = 'BEHANDLING_FORHINDRER_ARBEID',
    BehandlingSterilisering = 'BEHANDLING_STERILISERING',
    Donor = 'DONOR',
    GodkjentHelseinstitusjon = 'GODKJENT_HELSEINSTITUSJON',
    MottarTilskuddGrunnetHelsetilstand = 'MOTTAR_TILSKUDD_GRUNNET_HELSETILSTAND',
    NodvendigKontrollundenrsokelse = 'NODVENDIG_KONTROLLUNDENRSOKELSE',
    Smittefare = 'SMITTEFARE',
    UforGrunnetBarnloshet = 'UFOR_GRUNNET_BARNLOSHET',
}

export type AnnenFraversArsak = {
    __typename?: 'AnnenFraversArsak';
    beskrivelse?: Maybe<Scalars['String']>;
    grunn: Array<AnnenFraverGrunn>;
};

export type Arbeidsgiver = {
    __typename?: 'Arbeidsgiver';
    harArbeidsgiver: HarArbeidsgiver;
    navn?: Maybe<Scalars['String']>;
    stillingsprosent?: Maybe<Scalars['Int']>;
    yrkesbetegnelse?: Maybe<Scalars['String']>;
};

export type ArbeidsrelatertArsak = {
    __typename?: 'ArbeidsrelatertArsak';
    arsak: Array<ArbeidsrelatertArsakType>;
    beskrivelse?: Maybe<Scalars['String']>;
};

export enum ArbeidsrelatertArsakType {
    Annet = 'ANNET',
    ManglendeTilrettelegging = 'MANGLENDE_TILRETTELEGGING',
}

export type AvsenderSystem = {
    __typename?: 'AvsenderSystem';
    navn: Scalars['String'];
    versjon: Scalars['String'];
};

export type Behandler = {
    __typename?: 'Behandler';
    adresse: Adresse;
    aktoerId: Scalars['String'];
    etternavn: Scalars['String'];
    fnr: Scalars['String'];
    fornavn: Scalars['String'];
    her?: Maybe<Scalars['String']>;
    hpr?: Maybe<Scalars['String']>;
    mellomnavn?: Maybe<Scalars['String']>;
    tlf?: Maybe<Scalars['String']>;
};

export type Diagnose = {
    __typename?: 'Diagnose';
    kode: Scalars['String'];
    system: Scalars['String'];
    tekst?: Maybe<Scalars['String']>;
};

export type ErIArbeid = {
    __typename?: 'ErIArbeid';
    annetArbeidPaSikt: Scalars['Boolean'];
    arbeidFOM?: Maybe<Scalars['LocalDate']>;
    egetArbeidPaSikt: Scalars['Boolean'];
    vurderingsdato?: Maybe<Scalars['LocalDate']>;
};

export type ErIkkeIArbeid = {
    __typename?: 'ErIkkeIArbeid';
    arbeidsforFOM?: Maybe<Scalars['LocalDate']>;
    arbeidsforPaSikt: Scalars['Boolean'];
    vurderingsdato?: Maybe<Scalars['LocalDate']>;
};

export type Gradert = {
    __typename?: 'Gradert';
    grad: Scalars['Int'];
    reisetilskudd: Scalars['Boolean'];
};

export enum HarArbeidsgiver {
    EnArbeidsgiver = 'EN_ARBEIDSGIVER',
    FlereArbeidsgivere = 'FLERE_ARBEIDSGIVERE',
    IngenArbeidsgiver = 'INGEN_ARBEIDSGIVER',
}

export type KontaktMedPasient = {
    __typename?: 'KontaktMedPasient';
    begrunnelseIkkeKontakt?: Maybe<Scalars['String']>;
    kontaktDato?: Maybe<Scalars['LocalDate']>;
};

export type MedisinskArsak = {
    __typename?: 'MedisinskArsak';
    arsak?: Maybe<Array<Maybe<MedisinskArsakType>>>;
    beskrivelse?: Maybe<Scalars['String']>;
};

export enum MedisinskArsakType {
    AktivitetForhindrerBedring = 'AKTIVITET_FORHINDRER_BEDRING',
    AktivitetForverrerTilstand = 'AKTIVITET_FORVERRER_TILSTAND',
    Annet = 'ANNET',
    TilstandHindrerAktivitet = 'TILSTAND_HINDRER_AKTIVITET',
}

export type MedisinskVurdering = {
    __typename?: 'MedisinskVurdering';
    annenFraversArsak?: Maybe<AnnenFraversArsak>;
    biDiagnoser?: Maybe<Array<Maybe<Diagnose>>>;
    hovedDiagnose?: Maybe<Diagnose>;
    svangerskap: Scalars['Boolean'];
    yrkesskade: Scalars['Boolean'];
    yrkesskadeDato?: Maybe<Scalars['LocalDate']>;
};

export type MeldingTilNav = {
    __typename?: 'MeldingTilNAV';
    beskrivBistand?: Maybe<Scalars['String']>;
    bistandUmiddelbart: Scalars['Boolean'];
};

export type Periode = {
    __typename?: 'Periode';
    aktivitetIkkeMulig?: Maybe<AktivitetIkkeMulig>;
    avventendeInnspillTilArbeidsgiver?: Maybe<Scalars['String']>;
    behandlingsdager?: Maybe<Scalars['Int']>;
    fom: Scalars['LocalDate'];
    gradert?: Maybe<Gradert>;
    reisetilskudd: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
};

export type Prognose = {
    __typename?: 'Prognose';
    arbeidsforEtterPeriode: Scalars['Boolean'];
    erIArbeid?: Maybe<ErIArbeid>;
    erIkkeIArbeid?: Maybe<ErIkkeIArbeid>;
    hensynArbeidsplassen?: Maybe<Scalars['String']>;
};

export type Query = {
    __typename?: 'Query';
    viewer: Viewer;
    virksomhet?: Maybe<Virksomhet>;
};

export type QueryVirksomhetArgs = {
    orgnummer: Scalars['ID'];
};

export type Soknad = {
    __typename?: 'Soknad';
    id: Scalars['ID'];
    lest: Scalars['Boolean'];
};

export type SporsmalSvar = {
    __typename?: 'SporsmalSvar';
    restriksjoner: Array<SvarRestriksjon>;
    sporsmal: Scalars['String'];
    svar: Scalars['String'];
};

export type SporsmalSvarOpplysninger = {
    __typename?: 'SporsmalSvarOpplysninger';
    navn: Scalars['String'];
    svar: SporsmalSvar;
};

export enum SvarRestriksjon {
    SkjermetForArbeidsgiver = 'SKJERMET_FOR_ARBEIDSGIVER',
    SkjermetForNav = 'SKJERMET_FOR_NAV',
    SkjermetForPasient = 'SKJERMET_FOR_PASIENT',
}

export type Sykmelding = {
    __typename?: 'Sykmelding';
    andreTiltak?: Maybe<Scalars['String']>;
    arbeidsgiver: Arbeidsgiver;
    avsenderSystem: AvsenderSystem;
    behandler: Behandler;
    behandletTidspunkt: Scalars['LocalDateTime'];
    id: Scalars['String'];
    kontaktMedPasient: KontaktMedPasient;
    medisinskVurdering: MedisinskVurdering;
    meldingTilArbeidsgiver?: Maybe<Scalars['String']>;
    meldingTilNAV?: Maybe<MeldingTilNav>;
    msgId: Scalars['String'];
    navnFastlege?: Maybe<Scalars['String']>;
    pasientAktoerId: Scalars['String'];
    perioder: Array<Periode>;
    prognose: Prognose;
    signaturDato: Scalars['LocalDateTime'];
    skjermesForPasient: Scalars['Boolean'];
    syketilfelleStartDato?: Maybe<Scalars['LocalDate']>;
    tiltakArbeidsplassen?: Maybe<Scalars['String']>;
    tiltakNAV?: Maybe<Scalars['String']>;
    utdypendeOpplysninger: Array<UtdypendeOpplysninger>;
};

export type Sykmeldt = {
    __typename?: 'Sykmeldt';
    navn: Scalars['String'];
    soknader: Array<Soknad>;
    sykmeldinger: Array<Sykmelding>;
    uuid: Scalars['ID'];
};

export type UtdypendeOpplysninger = {
    __typename?: 'UtdypendeOpplysninger';
    navn: Scalars['String'];
    opplysninger: Array<SporsmalSvarOpplysninger>;
};

export type Viewer = {
    __typename?: 'Viewer';
    virksomheter?: Maybe<Array<Virksomhet>>;
};

export type Virksomhet = {
    __typename?: 'Virksomhet';
    navn: Scalars['String'];
    orgnummer: Scalars['String'];
    sykmeldte?: Maybe<Array<Sykmeldt>>;
};

export type FullSykemeldingFragment = {
    __typename?: 'Sykmelding';
    id: string;
    navnFastlege?: string | null | undefined;
};

export type FullSykmeldtFragment = {
    __typename?: 'Sykmeldt';
    uuid: string;
    navn: string;
    sykmeldinger: Array<{ __typename?: 'Sykmelding'; id: string; navnFastlege?: string | null | undefined }>;
};

export type SykmeldingerQueryVariables = Exact<{
    selectedOrg: Scalars['ID'];
}>;

export type SykmeldingerQuery = {
    __typename?: 'Query';
    virksomhet?:
        | {
              __typename?: 'Virksomhet';
              navn: string;
              orgnummer: string;
              sykmeldte?:
                  | Array<{
                        __typename?: 'Sykmeldt';
                        uuid: string;
                        navn: string;
                        sykmeldinger: Array<{
                            __typename?: 'Sykmelding';
                            id: string;
                            navnFastlege?: string | null | undefined;
                        }>;
                    }>
                  | null
                  | undefined;
          }
        | null
        | undefined;
};

export type VirksomheterQueryVariables = Exact<{ [key: string]: never }>;

export type VirksomheterQuery = {
    __typename?: 'Query';
    viewer: {
        __typename?: 'Viewer';
        virksomheter?: Array<{ __typename?: 'Virksomhet'; orgnummer: string; navn: string }> | null | undefined;
    };
};

export const FullSykemeldingFragmentDoc = `
    fragment FullSykemelding on Sykmelding {
  id
  navnFastlege
}
    `;
export const FullSykmeldtFragmentDoc = `
    fragment FullSykmeldt on Sykmeldt {
  uuid
  navn
  sykmeldinger {
    ...FullSykemelding
  }
}
    ${FullSykemeldingFragmentDoc}`;
export const SykmeldingerDocument = `
    query Sykmeldinger($selectedOrg: ID!) {
  virksomhet(orgnummer: $selectedOrg) {
    navn
    orgnummer
    sykmeldte {
      ...FullSykmeldt
    }
  }
}
    ${FullSykmeldtFragmentDoc}`;
export const useSykmeldingerQuery = <TData = SykmeldingerQuery, TError = Error>(
    variables: SykmeldingerQueryVariables,
    options?: UseQueryOptions<SykmeldingerQuery, TError, TData>,
) =>
    useQuery<SykmeldingerQuery, TError, TData>(
        ['Sykmeldinger', variables],
        fetcher<SykmeldingerQuery, SykmeldingerQueryVariables>(SykmeldingerDocument, variables),
        options,
    );
useSykmeldingerQuery.document = SykmeldingerDocument;

useSykmeldingerQuery.getKey = (variables: SykmeldingerQueryVariables) => ['Sykmeldinger', variables];

export const VirksomheterDocument = `
    query Virksomheter {
  viewer {
    virksomheter {
      orgnummer
      navn
    }
  }
}
    `;
export const useVirksomheterQuery = <TData = VirksomheterQuery, TError = Error>(
    variables?: VirksomheterQueryVariables,
    options?: UseQueryOptions<VirksomheterQuery, TError, TData>,
) =>
    useQuery<VirksomheterQuery, TError, TData>(
        ['Virksomheter', variables],
        fetcher<VirksomheterQuery, VirksomheterQueryVariables>(VirksomheterDocument, variables),
        options,
    );
useVirksomheterQuery.document = VirksomheterDocument;

useVirksomheterQuery.getKey = (variables?: VirksomheterQueryVariables) => ['Virksomheter', variables];
