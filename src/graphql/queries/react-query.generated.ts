/* eslint-disable */
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';
import { fetcher } from './clientFetcher';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type AktivitetIkkeMulig = FomTom & {
    arbeidsrelatertArsak?: Maybe<ArbeidsrelatertArsak>;
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type Arbeidsgiver = {
    navn?: Maybe<Scalars['String']>;
    orgnummer: Scalars['String'];
    yrke?: Maybe<Scalars['String']>;
};

export type ArbeidsrelatertArsak = {
    arsak: Array<ArbeidsrelatertArsakEnum>;
    beskrivelse?: Maybe<Scalars['String']>;
};

export enum ArbeidsrelatertArsakEnum {
    Annet = 'ANNET',
    ManglendeTilrettelegging = 'MANGLENDE_TILRETTELEGGING',
}

export type Avventende = FomTom & {
    fom: Scalars['LocalDate'];
    tilrettelegging?: Maybe<Scalars['String']>;
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type BasePreviewSoknad = {
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type Behandler = {
    hprNummer?: Maybe<Scalars['String']>;
    navn: Scalars['String'];
    telefon?: Maybe<Scalars['String']>;
};

export type Behandlingsdager = FomTom & {
    behandlingsdager: Scalars['Int'];
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type FomTom = {
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
};

export type Gradert = FomTom & {
    fom: Scalars['LocalDate'];
    grad: Scalars['Int'];
    reisetilskudd: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type Mutation = {
    read?: Maybe<Scalars['Boolean']>;
};

export type MutationReadArgs = {
    id: Scalars['ID'];
    type: ReadType;
};

export type Periode = AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd;

export enum PeriodeEnum {
    AktivitetIkkeMulig = 'AKTIVITET_IKKE_MULIG',
    Avventende = 'AVVENTENDE',
    Behandlingsdager = 'BEHANDLINGSDAGER',
    Gradert = 'GRADERT',
    Reisetilskudd = 'REISETILSKUDD',
}

export type PreviewFremtidigSoknad = BasePreviewSoknad & {
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type PreviewKorrigertSoknad = BasePreviewSoknad & {
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    korrigererSoknadId: Scalars['String'];
    korrigertBySoknadId?: Maybe<Scalars['String']>;
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type PreviewNySoknad = BasePreviewSoknad & {
    fom: Scalars['LocalDate'];
    frist: Scalars['LocalDate'];
    id: Scalars['String'];
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
    varsel: Scalars['Boolean'];
};

export type PreviewSendtSoknad = BasePreviewSoknad & {
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    korrigertBySoknadId?: Maybe<Scalars['String']>;
    lest: Scalars['Boolean'];
    sendtDato: Scalars['LocalDateTime'];
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type PreviewSoknad = PreviewFremtidigSoknad | PreviewKorrigertSoknad | PreviewNySoknad | PreviewSendtSoknad;

export type PreviewSykmelding = {
    fom: Scalars['LocalDate'];
    id: Scalars['ID'];
    lest: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
    type: Scalars['String'];
};

export type PreviewSykmeldt = {
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

export type Reisetilskudd = FomTom & {
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type Soknad = {
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
    status: SoknadsstatusEnum;
    type: SoknadstypeEnum;
};

export enum SoknadsstatusEnum {
    Fremtidig = 'FREMTIDIG',
    Korrigert = 'KORRIGERT',
    Ny = 'NY',
    Sendt = 'SENDT',
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
    navn: Scalars['String'];
    orgnummer: Scalars['String'];
};

export type MarkSoknadReadMutationVariables = Exact<{
    soknadId: Scalars['ID'];
}>;

export type MarkSoknadReadMutation = { read?: boolean | null | undefined };

export type MarkSykmeldingReadMutationVariables = Exact<{
    sykmeldingId: Scalars['ID'];
}>;

export type MarkSykmeldingReadMutation = { read?: boolean | null | undefined };

export type SoknadFragment = { id: string; fnr: string; lest: boolean };

export type SoknadByIdQueryVariables = Exact<{
    soknadId: Scalars['ID'];
}>;

export type SoknadByIdQuery = { soknad?: { id: string; fnr: string; lest: boolean } | null | undefined };

export type SykmeldingFragment = {
    id: string;
    fnr: string;
    lest: boolean;
    navn: string;
    startdatoSykefravar: string;
    arbeidsforEtterPeriode?: boolean | null | undefined;
    tiltakArbeidsplassen?: string | null | undefined;
    arbeidsgiver: { navn?: string | null | undefined; yrke?: string | null | undefined };
    behandler: { navn: string; telefon?: string | null | undefined };
    perioder: Array<
        | {
              __typename: 'AktivitetIkkeMulig';
              fom: string;
              tom: string;
              arbeidsrelatertArsak?:
                  | { arsak: Array<ArbeidsrelatertArsakEnum>; beskrivelse?: string | null | undefined }
                  | null
                  | undefined;
          }
        | { __typename: 'Avventende'; fom: string; tom: string; tilrettelegging?: string | null | undefined }
        | { __typename: 'Behandlingsdager'; fom: string; tom: string; behandlingsdager: number }
        | { __typename: 'Gradert'; fom: string; tom: string; grad: number; reisetilskudd: boolean }
        | { __typename: 'Reisetilskudd'; fom: string; tom: string }
    >;
};

export type SykmeldingPeriode_AktivitetIkkeMulig_Fragment = {
    __typename: 'AktivitetIkkeMulig';
    fom: string;
    tom: string;
    arbeidsrelatertArsak?:
        | { arsak: Array<ArbeidsrelatertArsakEnum>; beskrivelse?: string | null | undefined }
        | null
        | undefined;
};

export type SykmeldingPeriode_Avventende_Fragment = {
    __typename: 'Avventende';
    fom: string;
    tom: string;
    tilrettelegging?: string | null | undefined;
};

export type SykmeldingPeriode_Behandlingsdager_Fragment = {
    __typename: 'Behandlingsdager';
    fom: string;
    tom: string;
    behandlingsdager: number;
};

export type SykmeldingPeriode_Gradert_Fragment = {
    __typename: 'Gradert';
    fom: string;
    tom: string;
    grad: number;
    reisetilskudd: boolean;
};

export type SykmeldingPeriode_Reisetilskudd_Fragment = { __typename: 'Reisetilskudd'; fom: string; tom: string };

export type SykmeldingPeriodeFragment =
    | SykmeldingPeriode_AktivitetIkkeMulig_Fragment
    | SykmeldingPeriode_Avventende_Fragment
    | SykmeldingPeriode_Behandlingsdager_Fragment
    | SykmeldingPeriode_Gradert_Fragment
    | SykmeldingPeriode_Reisetilskudd_Fragment;

export type SykmeldingByIdQueryVariables = Exact<{
    sykmeldingId: Scalars['ID'];
}>;

export type SykmeldingByIdQuery = {
    sykmelding?:
        | {
              id: string;
              fnr: string;
              lest: boolean;
              navn: string;
              startdatoSykefravar: string;
              arbeidsforEtterPeriode?: boolean | null | undefined;
              tiltakArbeidsplassen?: string | null | undefined;
              arbeidsgiver: { navn?: string | null | undefined; yrke?: string | null | undefined };
              behandler: { navn: string; telefon?: string | null | undefined };
              perioder: Array<
                  | {
                        __typename: 'AktivitetIkkeMulig';
                        fom: string;
                        tom: string;
                        arbeidsrelatertArsak?:
                            | { arsak: Array<ArbeidsrelatertArsakEnum>; beskrivelse?: string | null | undefined }
                            | null
                            | undefined;
                    }
                  | { __typename: 'Avventende'; fom: string; tom: string; tilrettelegging?: string | null | undefined }
                  | { __typename: 'Behandlingsdager'; fom: string; tom: string; behandlingsdager: number }
                  | { __typename: 'Gradert'; fom: string; tom: string; grad: number; reisetilskudd: boolean }
                  | { __typename: 'Reisetilskudd'; fom: string; tom: string }
              >;
          }
        | null
        | undefined;
};

export type PreviewSykmeldingFragment = { id: string; fom: string; tom: string; lest: boolean; type: string };

export type PreviewSoknad_PreviewFremtidigSoknad_Fragment = {
    __typename: 'PreviewFremtidigSoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
};

export type PreviewSoknad_PreviewKorrigertSoknad_Fragment = {
    __typename: 'PreviewKorrigertSoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
    korrigererSoknadId: string;
    korrigertBySoknadId?: string | null | undefined;
};

export type PreviewSoknad_PreviewNySoknad_Fragment = {
    __typename: 'PreviewNySoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
    frist: string;
    varsel: boolean;
};

export type PreviewSoknad_PreviewSendtSoknad_Fragment = {
    __typename: 'PreviewSendtSoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
    lest: boolean;
    sendtDato: string;
    korrigertBySoknadId?: string | null | undefined;
};

export type PreviewSoknadFragment =
    | PreviewSoknad_PreviewFremtidigSoknad_Fragment
    | PreviewSoknad_PreviewKorrigertSoknad_Fragment
    | PreviewSoknad_PreviewNySoknad_Fragment
    | PreviewSoknad_PreviewSendtSoknad_Fragment;

export type PreviewSykmeldtFragment = {
    fnr: string;
    navn: string;
    orgnummer: string;
    friskmeldt: boolean;
    narmestelederId: string;
    startdatoSykefravar: string;
    previewSykmeldinger: Array<{ id: string; fom: string; tom: string; lest: boolean; type: string }>;
    previewSoknader: Array<
        | { __typename: 'PreviewFremtidigSoknad'; id: string; sykmeldingId: string; fom: string; tom: string }
        | {
              __typename: 'PreviewKorrigertSoknad';
              id: string;
              sykmeldingId: string;
              fom: string;
              tom: string;
              korrigererSoknadId: string;
              korrigertBySoknadId?: string | null | undefined;
          }
        | {
              __typename: 'PreviewNySoknad';
              id: string;
              sykmeldingId: string;
              fom: string;
              tom: string;
              frist: string;
              varsel: boolean;
          }
        | {
              __typename: 'PreviewSendtSoknad';
              id: string;
              sykmeldingId: string;
              fom: string;
              tom: string;
              lest: boolean;
              sendtDato: string;
              korrigertBySoknadId?: string | null | undefined;
          }
    >;
};

export type MineSykmeldteQueryVariables = Exact<{ [key: string]: never }>;

export type MineSykmeldteQuery = {
    mineSykmeldte?:
        | Array<{
              fnr: string;
              navn: string;
              orgnummer: string;
              friskmeldt: boolean;
              narmestelederId: string;
              startdatoSykefravar: string;
              previewSykmeldinger: Array<{ id: string; fom: string; tom: string; lest: boolean; type: string }>;
              previewSoknader: Array<
                  | { __typename: 'PreviewFremtidigSoknad'; id: string; sykmeldingId: string; fom: string; tom: string }
                  | {
                        __typename: 'PreviewKorrigertSoknad';
                        id: string;
                        sykmeldingId: string;
                        fom: string;
                        tom: string;
                        korrigererSoknadId: string;
                        korrigertBySoknadId?: string | null | undefined;
                    }
                  | {
                        __typename: 'PreviewNySoknad';
                        id: string;
                        sykmeldingId: string;
                        fom: string;
                        tom: string;
                        frist: string;
                        varsel: boolean;
                    }
                  | {
                        __typename: 'PreviewSendtSoknad';
                        id: string;
                        sykmeldingId: string;
                        fom: string;
                        tom: string;
                        lest: boolean;
                        sendtDato: string;
                        korrigertBySoknadId?: string | null | undefined;
                    }
              >;
          }>
        | null
        | undefined;
};

export type VirksomheterQueryVariables = Exact<{ [key: string]: never }>;

export type VirksomheterQuery = { virksomheter: Array<{ orgnummer: string; navn: string }> };

export const SoknadFragmentDoc = `
    fragment Soknad on Soknad {
  id
  fnr
  lest
}
    `;
export const SykmeldingPeriodeFragmentDoc = `
    fragment SykmeldingPeriode on Periode {
  __typename
  ... on FomTom {
    fom
    tom
  }
  ... on AktivitetIkkeMulig {
    arbeidsrelatertArsak {
      arsak
      beskrivelse
    }
  }
  ... on Gradert {
    grad
    reisetilskudd
  }
  ... on Avventende {
    tilrettelegging
  }
  ... on Behandlingsdager {
    behandlingsdager
  }
}
    `;
export const SykmeldingFragmentDoc = `
    fragment Sykmelding on Sykmelding {
  id
  fnr
  lest
  navn
  startdatoSykefravar
  arbeidsforEtterPeriode
  tiltakArbeidsplassen
  arbeidsgiver {
    navn
    yrke
  }
  behandler {
    navn
    telefon
  }
  perioder {
    ...SykmeldingPeriode
  }
}
    ${SykmeldingPeriodeFragmentDoc}`;
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
  __typename
  ... on BasePreviewSoknad {
    id
    sykmeldingId
    fom
    tom
  }
  ... on PreviewNySoknad {
    frist
    varsel
  }
  ... on PreviewKorrigertSoknad {
    korrigererSoknadId
    korrigertBySoknadId
  }
  ... on PreviewSendtSoknad {
    lest
    sendtDato
    korrigertBySoknadId
  }
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
        ['MarkSoknadRead'],
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
        ['MarkSykmeldingRead'],
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
