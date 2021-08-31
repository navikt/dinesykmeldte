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
    postnummer?: Maybe<Scalars['Int']>;
    kommune?: Maybe<Scalars['String']>;
    postboks?: Maybe<Scalars['String']>;
    land?: Maybe<Scalars['String']>;
};

export type AktivitetIkkeMulig = {
    __typename?: 'AktivitetIkkeMulig';
    medisinskArsak?: Maybe<MedisinskArsak>;
    arbeidsrelatertArsak?: Maybe<ArbeidsrelatertArsak>;
};

export enum AnnenFraverGrunn {
    GodkjentHelseinstitusjon = 'GODKJENT_HELSEINSTITUSJON',
    BehandlingForhindrerArbeid = 'BEHANDLING_FORHINDRER_ARBEID',
    ArbeidsrettetTiltak = 'ARBEIDSRETTET_TILTAK',
    MottarTilskuddGrunnetHelsetilstand = 'MOTTAR_TILSKUDD_GRUNNET_HELSETILSTAND',
    NodvendigKontrollundenrsokelse = 'NODVENDIG_KONTROLLUNDENRSOKELSE',
    Smittefare = 'SMITTEFARE',
    Abort = 'ABORT',
    UforGrunnetBarnloshet = 'UFOR_GRUNNET_BARNLOSHET',
    Donor = 'DONOR',
    BehandlingSterilisering = 'BEHANDLING_STERILISERING',
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
    yrkesbetegnelse?: Maybe<Scalars['String']>;
    stillingsprosent?: Maybe<Scalars['Int']>;
};

export type ArbeidsrelatertArsak = {
    __typename?: 'ArbeidsrelatertArsak';
    beskrivelse?: Maybe<Scalars['String']>;
    arsak: Array<ArbeidsrelatertArsakType>;
};

export enum ArbeidsrelatertArsakType {
    ManglendeTilrettelegging = 'MANGLENDE_TILRETTELEGGING',
    Annet = 'ANNET',
}

export type AvsenderSystem = {
    __typename?: 'AvsenderSystem';
    navn: Scalars['String'];
    versjon: Scalars['String'];
};

export type Behandler = {
    __typename?: 'Behandler';
    fornavn: Scalars['String'];
    mellomnavn?: Maybe<Scalars['String']>;
    etternavn: Scalars['String'];
    aktoerId: Scalars['String'];
    fnr: Scalars['String'];
    hpr?: Maybe<Scalars['String']>;
    her?: Maybe<Scalars['String']>;
    adresse: Adresse;
    tlf?: Maybe<Scalars['String']>;
};

export type Diagnose = {
    __typename?: 'Diagnose';
    system: Scalars['String'];
    kode: Scalars['String'];
    tekst?: Maybe<Scalars['String']>;
};

export type ErIArbeid = {
    __typename?: 'ErIArbeid';
    egetArbeidPaSikt: Scalars['Boolean'];
    annetArbeidPaSikt: Scalars['Boolean'];
    arbeidFOM?: Maybe<Scalars['LocalDate']>;
    vurderingsdato?: Maybe<Scalars['LocalDate']>;
};

export type ErIkkeIArbeid = {
    __typename?: 'ErIkkeIArbeid';
    arbeidsforPaSikt: Scalars['Boolean'];
    arbeidsforFOM?: Maybe<Scalars['LocalDate']>;
    vurderingsdato?: Maybe<Scalars['LocalDate']>;
};

export type Gradert = {
    __typename?: 'Gradert';
    reisetilskudd: Scalars['Boolean'];
    grad: Scalars['Int'];
};

export enum HarArbeidsgiver {
    EnArbeidsgiver = 'EN_ARBEIDSGIVER',
    FlereArbeidsgivere = 'FLERE_ARBEIDSGIVERE',
    IngenArbeidsgiver = 'INGEN_ARBEIDSGIVER',
}

export type KontaktMedPasient = {
    __typename?: 'KontaktMedPasient';
    kontaktDato?: Maybe<Scalars['LocalDate']>;
    begrunnelseIkkeKontakt?: Maybe<Scalars['String']>;
};

export type MedisinskArsak = {
    __typename?: 'MedisinskArsak';
    beskrivelse?: Maybe<Scalars['String']>;
    arsak?: Maybe<Array<Maybe<MedisinskArsakType>>>;
};

export enum MedisinskArsakType {
    TilstandHindrerAktivitet = 'TILSTAND_HINDRER_AKTIVITET',
    AktivitetForverrerTilstand = 'AKTIVITET_FORVERRER_TILSTAND',
    AktivitetForhindrerBedring = 'AKTIVITET_FORHINDRER_BEDRING',
    Annet = 'ANNET',
}

export type MedisinskVurdering = {
    __typename?: 'MedisinskVurdering';
    hovedDiagnose?: Maybe<Diagnose>;
    biDiagnoser?: Maybe<Array<Maybe<Diagnose>>>;
    svangerskap: Scalars['Boolean'];
    yrkesskade: Scalars['Boolean'];
    yrkesskadeDato?: Maybe<Scalars['LocalDate']>;
    annenFraversArsak?: Maybe<AnnenFraversArsak>;
};

export type MeldingTilNav = {
    __typename?: 'MeldingTilNAV';
    bistandUmiddelbart: Scalars['Boolean'];
    beskrivBistand?: Maybe<Scalars['String']>;
};

export type Periode = {
    __typename?: 'Periode';
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
    aktivitetIkkeMulig?: Maybe<AktivitetIkkeMulig>;
    avventendeInnspillTilArbeidsgiver?: Maybe<Scalars['String']>;
    behandlingsdager?: Maybe<Scalars['Int']>;
    gradert?: Maybe<Gradert>;
    reisetilskudd: Scalars['Boolean'];
};

export type Prognose = {
    __typename?: 'Prognose';
    arbeidsforEtterPeriode: Scalars['Boolean'];
    hensynArbeidsplassen?: Maybe<Scalars['String']>;
    erIArbeid?: Maybe<ErIArbeid>;
    erIkkeIArbeid?: Maybe<ErIkkeIArbeid>;
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
    lest: Scalars['Boolean'];
    id: Scalars['ID'];
};

export type SporsmalSvar = {
    __typename?: 'SporsmalSvar';
    sporsmal: Scalars['String'];
    svar: Scalars['String'];
    restriksjoner: Array<SvarRestriksjon>;
};

export type SporsmalSvarOpplysninger = {
    __typename?: 'SporsmalSvarOpplysninger';
    navn: Scalars['String'];
    svar: SporsmalSvar;
};

export enum SvarRestriksjon {
    SkjermetForArbeidsgiver = 'SKJERMET_FOR_ARBEIDSGIVER',
    SkjermetForPasient = 'SKJERMET_FOR_PASIENT',
    SkjermetForNav = 'SKJERMET_FOR_NAV',
}

export type Sykmelding = {
    __typename?: 'Sykmelding';
    id: Scalars['String'];
    msgId: Scalars['String'];
    pasientAktoerId: Scalars['String'];
    medisinskVurdering: MedisinskVurdering;
    skjermesForPasient: Scalars['Boolean'];
    arbeidsgiver: Arbeidsgiver;
    perioder: Array<Periode>;
    prognose: Prognose;
    utdypendeOpplysninger: Array<UtdypendeOpplysninger>;
    tiltakArbeidsplassen?: Maybe<Scalars['String']>;
    tiltakNAV?: Maybe<Scalars['String']>;
    andreTiltak?: Maybe<Scalars['String']>;
    meldingTilNAV?: Maybe<MeldingTilNav>;
    meldingTilArbeidsgiver?: Maybe<Scalars['String']>;
    kontaktMedPasient: KontaktMedPasient;
    behandletTidspunkt: Scalars['LocalDateTime'];
    behandler: Behandler;
    avsenderSystem: AvsenderSystem;
    syketilfelleStartDato?: Maybe<Scalars['LocalDate']>;
    signaturDato: Scalars['LocalDateTime'];
    navnFastlege?: Maybe<Scalars['String']>;
};

export type Sykmeldt = {
    __typename?: 'Sykmeldt';
    uuid: Scalars['ID'];
    navn: Scalars['String'];
    sykmeldinger: Array<Sykmelding>;
    soknader: Array<Soknad>;
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
    orgnummer: Scalars['String'];
    navn: Scalars['String'];
    sykmeldte?: Maybe<Array<Sykmeldt>>;
};

export type FullSykemeldingFragment = { __typename?: 'Sykmelding'; id: string; navnFastlege?: Maybe<string> };

export type FullSykmeldtFragment = {
    __typename?: 'Sykmeldt';
    uuid: string;
    navn: string;
    sykmeldinger: Array<{ __typename?: 'Sykmelding'; id: string; navnFastlege?: Maybe<string> }>;
};

export type SykmeldingerQueryVariables = Exact<{
    selectedOrg: Scalars['ID'];
}>;

export type SykmeldingerQuery = {
    __typename?: 'Query';
    virksomhet?: Maybe<{
        __typename?: 'Virksomhet';
        navn: string;
        orgnummer: string;
        sykmeldte?: Maybe<
            Array<{
                __typename?: 'Sykmeldt';
                uuid: string;
                navn: string;
                sykmeldinger: Array<{ __typename?: 'Sykmelding'; id: string; navnFastlege?: Maybe<string> }>;
            }>
        >;
    }>;
};

export type VirksomheterQueryVariables = Exact<{ [key: string]: never }>;

export type VirksomheterQuery = {
    __typename?: 'Query';
    viewer: {
        __typename?: 'Viewer';
        virksomheter?: Maybe<Array<{ __typename?: 'Virksomhet'; orgnummer: string; navn: string }>>;
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
