/* eslint-disable */
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
    return async (): Promise<TData> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/graphql` as string, {
            method: 'POST',
            ...{
                headers: {
                    'Content-Type': 'application/json',
                },
            },
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
    LocalDate: string;
    LocalDateTime: string;
};

export type AktivitetIkkeMulig = {
    __typename: 'AktivitetIkkeMulig';
    arbeidsrelatertArsak?: Maybe<ArbeidsrelatertArsak>;
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
};

export type Arbeidsgiver = {
    __typename: 'Arbeidsgiver';
    navn?: Maybe<Scalars['String']>;
    orgnummer: Scalars['String'];
    yrke?: Maybe<Scalars['String']>;
};

export type ArbeidsrelatertArsak = {
    __typename: 'ArbeidsrelatertArsak';
    arsak: Array<ArbeidsrelatertArsakEnum>;
    beskrivelse?: Maybe<Scalars['String']>;
};

export enum ArbeidsrelatertArsakEnum {
    Annet = 'ANNET',
    ManglendeTilrettelegging = 'MANGLENDE_TILRETTELEGGING',
}

export type Avventende = {
    __typename: 'Avventende';
    fom: Scalars['LocalDate'];
    tilrettelegging?: Maybe<Scalars['String']>;
    tom: Scalars['LocalDate'];
};

export type Behandler = {
    __typename: 'Behandler';
    hprNummer?: Maybe<Scalars['String']>;
    navn: Scalars['String'];
    telefon?: Maybe<Scalars['String']>;
};

export type Behandlingsdager = {
    __typename: 'Behandlingsdager';
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
};

export type Gradert = {
    __typename: 'Gradert';
    fom: Scalars['LocalDate'];
    grad: Scalars['Int'];
    reisetilskudd: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
};

export type Mutation = {
    __typename: 'Mutation';
    read?: Maybe<Scalars['Boolean']>;
};

export type MutationReadArgs = {
    id: Scalars['ID'];
    type: ReadType;
};

export type Periode = AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd;

export type PreviewSoknad = {
    __typename: 'PreviewSoknad';
    fom?: Maybe<Scalars['LocalDate']>;
    id: Scalars['ID'];
    lest: Scalars['Boolean'];
    sendtDato?: Maybe<Scalars['LocalDate']>;
    status: SoknadsstatusEnum;
    sykmeldingId?: Maybe<Scalars['String']>;
    tom?: Maybe<Scalars['LocalDate']>;
};

export type PreviewSykmelding = {
    __typename: 'PreviewSykmelding';
    fom: Scalars['LocalDate'];
    id: Scalars['ID'];
    lest: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
    type: Scalars['String'];
};

export type PreviewSykmeldt = {
    __typename: 'PreviewSykmeldt';
    fnr: Scalars['String'];
    friskmeldt: Scalars['Boolean'];
    narmestelederId: Scalars['String'];
    navn: Scalars['String'];
    orgnummer: Scalars['String'];
    previewSoknader: Array<PreviewSoknad>;
    previewSykmeldinger: Array<PreviewSykmelding>;
    startdatoSykefravar: Scalars['LocalDate'];
};

export type Query = {
    __typename: 'Query';
    mineSykmeldte?: Maybe<Array<PreviewSykmeldt>>;
    soknad?: Maybe<Soknad>;
    sykmelding?: Maybe<Sykmelding>;
    virksomheter: Array<Virksomhet>;
};

export type QuerySoknadArgs = {
    soknadId: Scalars['ID'];
};

export type QuerySykmeldingArgs = {
    sykmeldingId: Scalars['ID'];
};

export enum ReadType {
    Soknad = 'Soknad',
    Sykmelding = 'Sykmelding',
}

export type Reisetilskudd = {
    __typename: 'Reisetilskudd';
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
};

export type Soknad = {
    __typename: 'Soknad';
    details: SoknadDetails;
    fnr: Scalars['String'];
    id: Scalars['ID'];
    lest: Scalars['Boolean'];
    navn: Scalars['String'];
    orgnummer: Scalars['String'];
    sendtDato: Scalars['LocalDate'];
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type SoknadDetails = {
    __typename: 'SoknadDetails';
    status: SoknadsstatusEnum;
    type: SoknadstypeEnum;
};

export enum SoknadsstatusEnum {
    Avbrutt = 'AVBRUTT',
    Fremtidig = 'FREMTIDIG',
    Korrigert = 'KORRIGERT',
    Ny = 'NY',
    Sendt = 'SENDT',
    Slettet = 'SLETTET',
}

export enum SoknadstypeEnum {
    AnnetArbeidsforhold = 'ANNET_ARBEIDSFORHOLD',
    Arbeidsledig = 'ARBEIDSLEDIG',
    Arbeidstakere = 'ARBEIDSTAKERE',
    Behandlingsdager = 'BEHANDLINGSDAGER',
    GradertReisetilskudd = 'GRADERT_REISETILSKUDD',
    OppholdUtland = 'OPPHOLD_UTLAND',
    Reisetilskudd = 'REISETILSKUDD',
    SelvstendigeOgFrilansere = 'SELVSTENDIGE_OG_FRILANSERE',
}

export type Sykmelding = {
    __typename: 'Sykmelding';
    arbeidsforEtterPeriode?: Maybe<Scalars['Boolean']>;
    arbeidsgiver: Arbeidsgiver;
    behandler: Behandler;
    fnr: Scalars['String'];
    hensynArbeidsplassen?: Maybe<Scalars['String']>;
    id: Scalars['ID'];
    innspillArbeidsplassen?: Maybe<Scalars['String']>;
    kontaktDato?: Maybe<Scalars['LocalDate']>;
    lest: Scalars['Boolean'];
    navn: Scalars['String'];
    perioder: Array<Periode>;
    startdatoSykefravar: Scalars['LocalDate'];
    tiltakArbeidsplassen?: Maybe<Scalars['String']>;
};

export type Virksomhet = {
    __typename: 'Virksomhet';
    navn: Scalars['String'];
    orgnummer: Scalars['String'];
};

export type MarkSoknadReadMutationVariables = Exact<{
    soknadId: Scalars['ID'];
}>;

export type MarkSoknadReadMutation = { __typename: 'Mutation'; read?: boolean | null | undefined };

export type MarkSykmeldingReadMutationVariables = Exact<{
    sykmeldingId: Scalars['ID'];
}>;

export type MarkSykmeldingReadMutation = { __typename: 'Mutation'; read?: boolean | null | undefined };

export type SoknadFragment = { __typename: 'Soknad'; id: string; fnr: string; lest: boolean };

export type SoknadByIdQueryVariables = Exact<{
    soknadId: Scalars['ID'];
}>;

export type SoknadByIdQuery = {
    __typename: 'Query';
    soknad?: { __typename: 'Soknad'; id: string; fnr: string; lest: boolean } | null | undefined;
};

export type SykmeldingFragment = { __typename: 'Sykmelding'; id: string; fnr: string; lest: boolean };

export type SykmeldingByIdQueryVariables = Exact<{
    sykmeldingId: Scalars['ID'];
}>;

export type SykmeldingByIdQuery = {
    __typename: 'Query';
    sykmelding?: { __typename: 'Sykmelding'; id: string; fnr: string; lest: boolean } | null | undefined;
};

export type PreviewSykmeldingFragment = {
    __typename: 'PreviewSykmelding';
    id: string;
    fom: string;
    tom: string;
    lest: boolean;
    type: string;
};

export type PreviewSoknadFragment = {
    __typename: 'PreviewSoknad';
    id: string;
    fom?: string | null | undefined;
    tom?: string | null | undefined;
    lest: boolean;
    status: SoknadsstatusEnum;
    sendtDato?: string | null | undefined;
    sykmeldingId?: string | null | undefined;
};

export type PreviewSykmeldtFragment = {
    __typename: 'PreviewSykmeldt';
    fnr: string;
    navn: string;
    orgnummer: string;
    friskmeldt: boolean;
    narmestelederId: string;
    startdatoSykefravar: string;
    previewSykmeldinger: Array<{
        __typename: 'PreviewSykmelding';
        id: string;
        fom: string;
        tom: string;
        lest: boolean;
        type: string;
    }>;
    previewSoknader: Array<{
        __typename: 'PreviewSoknad';
        id: string;
        fom?: string | null | undefined;
        tom?: string | null | undefined;
        lest: boolean;
        status: SoknadsstatusEnum;
        sendtDato?: string | null | undefined;
        sykmeldingId?: string | null | undefined;
    }>;
};

export type MineSykmeldteQueryVariables = Exact<{ [key: string]: never }>;

export type MineSykmeldteQuery = {
    __typename: 'Query';
    mineSykmeldte?:
        | Array<{
              __typename: 'PreviewSykmeldt';
              fnr: string;
              navn: string;
              orgnummer: string;
              friskmeldt: boolean;
              narmestelederId: string;
              startdatoSykefravar: string;
              previewSykmeldinger: Array<{
                  __typename: 'PreviewSykmelding';
                  id: string;
                  fom: string;
                  tom: string;
                  lest: boolean;
                  type: string;
              }>;
              previewSoknader: Array<{
                  __typename: 'PreviewSoknad';
                  id: string;
                  fom?: string | null | undefined;
                  tom?: string | null | undefined;
                  lest: boolean;
                  status: SoknadsstatusEnum;
                  sendtDato?: string | null | undefined;
                  sykmeldingId?: string | null | undefined;
              }>;
          }>
        | null
        | undefined;
};

export type VirksomheterQueryVariables = Exact<{ [key: string]: never }>;

export type VirksomheterQuery = {
    __typename: 'Query';
    virksomheter: Array<{ __typename: 'Virksomhet'; orgnummer: string; navn: string }>;
};

export const SoknadFragmentDoc = `
    fragment Soknad on Soknad {
  id
  fnr
  lest
}
    `;
export const SykmeldingFragmentDoc = `
    fragment Sykmelding on Sykmelding {
  id
  fnr
  lest
}
    `;
export const PreviewSykmeldingFragmentDoc = `
    fragment PreviewSykmelding on PreviewSykmelding {
  id
  fom
  tom
  lest
  type
}
    `;
export const PreviewSoknadFragmentDoc = `
    fragment PreviewSoknad on PreviewSoknad {
  id
  fom
  tom
  lest
  status
  sendtDato
  sykmeldingId
}
    `;
export const PreviewSykmeldtFragmentDoc = `
    fragment PreviewSykmeldt on PreviewSykmeldt {
  fnr
  navn
  orgnummer
  friskmeldt
  narmestelederId
  startdatoSykefravar
  previewSykmeldinger {
    ...PreviewSykmelding
  }
  previewSoknader {
    ...PreviewSoknad
  }
}
    ${PreviewSykmeldingFragmentDoc}
${PreviewSoknadFragmentDoc}`;
export const MarkSoknadReadDocument = `
    mutation MarkSoknadRead($soknadId: ID!) {
  read(type: Soknad, id: $soknadId)
}
    `;
export const useMarkSoknadReadMutation = <TError = Error, TContext = unknown>(
    options?: UseMutationOptions<MarkSoknadReadMutation, TError, MarkSoknadReadMutationVariables, TContext>,
) =>
    useMutation<MarkSoknadReadMutation, TError, MarkSoknadReadMutationVariables, TContext>(
        'MarkSoknadRead',
        (variables?: MarkSoknadReadMutationVariables) =>
            fetcher<MarkSoknadReadMutation, MarkSoknadReadMutationVariables>(MarkSoknadReadDocument, variables)(),
        options,
    );
export const MarkSykmeldingReadDocument = `
    mutation MarkSykmeldingRead($sykmeldingId: ID!) {
  read(type: Sykmelding, id: $sykmeldingId)
}
    `;
export const useMarkSykmeldingReadMutation = <TError = Error, TContext = unknown>(
    options?: UseMutationOptions<MarkSykmeldingReadMutation, TError, MarkSykmeldingReadMutationVariables, TContext>,
) =>
    useMutation<MarkSykmeldingReadMutation, TError, MarkSykmeldingReadMutationVariables, TContext>(
        'MarkSykmeldingRead',
        (variables?: MarkSykmeldingReadMutationVariables) =>
            fetcher<MarkSykmeldingReadMutation, MarkSykmeldingReadMutationVariables>(
                MarkSykmeldingReadDocument,
                variables,
            )(),
        options,
    );
export const SoknadByIdDocument = `
    query SoknadById($soknadId: ID!) {
  soknad(soknadId: $soknadId) {
    ...Soknad
  }
}
    ${SoknadFragmentDoc}`;
export const useSoknadByIdQuery = <TData = SoknadByIdQuery, TError = Error>(
    variables: SoknadByIdQueryVariables,
    options?: UseQueryOptions<SoknadByIdQuery, TError, TData>,
) =>
    useQuery<SoknadByIdQuery, TError, TData>(
        ['SoknadById', variables],
        fetcher<SoknadByIdQuery, SoknadByIdQueryVariables>(SoknadByIdDocument, variables),
        options,
    );
useSoknadByIdQuery.document = SoknadByIdDocument;

useSoknadByIdQuery.getKey = (variables: SoknadByIdQueryVariables) => ['SoknadById', variables];
export const SykmeldingByIdDocument = `
    query SykmeldingById($sykmeldingId: ID!) {
  sykmelding(sykmeldingId: $sykmeldingId) {
    ...Sykmelding
  }
}
    ${SykmeldingFragmentDoc}`;
export const useSykmeldingByIdQuery = <TData = SykmeldingByIdQuery, TError = Error>(
    variables: SykmeldingByIdQueryVariables,
    options?: UseQueryOptions<SykmeldingByIdQuery, TError, TData>,
) =>
    useQuery<SykmeldingByIdQuery, TError, TData>(
        ['SykmeldingById', variables],
        fetcher<SykmeldingByIdQuery, SykmeldingByIdQueryVariables>(SykmeldingByIdDocument, variables),
        options,
    );
useSykmeldingByIdQuery.document = SykmeldingByIdDocument;

useSykmeldingByIdQuery.getKey = (variables: SykmeldingByIdQueryVariables) => ['SykmeldingById', variables];
export const MineSykmeldteDocument = `
    query MineSykmeldte {
  mineSykmeldte {
    ...PreviewSykmeldt
  }
}
    ${PreviewSykmeldtFragmentDoc}`;
export const useMineSykmeldteQuery = <TData = MineSykmeldteQuery, TError = Error>(
    variables?: MineSykmeldteQueryVariables,
    options?: UseQueryOptions<MineSykmeldteQuery, TError, TData>,
) =>
    useQuery<MineSykmeldteQuery, TError, TData>(
        variables === undefined ? ['MineSykmeldte'] : ['MineSykmeldte', variables],
        fetcher<MineSykmeldteQuery, MineSykmeldteQueryVariables>(MineSykmeldteDocument, variables),
        options,
    );
useMineSykmeldteQuery.document = MineSykmeldteDocument;

useMineSykmeldteQuery.getKey = (variables?: MineSykmeldteQueryVariables) =>
    variables === undefined ? ['MineSykmeldte'] : ['MineSykmeldte', variables];
export const VirksomheterDocument = `
    query Virksomheter {
  virksomheter {
    orgnummer
    navn
  }
}
    `;
export const useVirksomheterQuery = <TData = VirksomheterQuery, TError = Error>(
    variables?: VirksomheterQueryVariables,
    options?: UseQueryOptions<VirksomheterQuery, TError, TData>,
) =>
    useQuery<VirksomheterQuery, TError, TData>(
        variables === undefined ? ['Virksomheter'] : ['Virksomheter', variables],
        fetcher<VirksomheterQuery, VirksomheterQueryVariables>(VirksomheterDocument, variables),
        options,
    );
useVirksomheterQuery.document = VirksomheterDocument;

useVirksomheterQuery.getKey = (variables?: VirksomheterQueryVariables) =>
    variables === undefined ? ['Virksomheter'] : ['Virksomheter', variables];
