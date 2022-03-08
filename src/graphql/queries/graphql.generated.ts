import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
    __typename?: 'AktivitetIkkeMulig';
    arbeidsrelatertArsak?: Maybe<ArbeidsrelatertArsak>;
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type Arbeidsgiver = {
    __typename?: 'Arbeidsgiver';
    navn?: Maybe<Scalars['String']>;
    orgnummer: Scalars['String'];
    yrke?: Maybe<Scalars['String']>;
};

export type ArbeidsrelatertArsak = {
    __typename?: 'ArbeidsrelatertArsak';
    arsak: Array<ArbeidsrelatertArsakEnum>;
    beskrivelse?: Maybe<Scalars['String']>;
};

export enum ArbeidsrelatertArsakEnum {
    Annet = 'ANNET',
    ManglendeTilrettelegging = 'MANGLENDE_TILRETTELEGGING',
}

export type Avventende = FomTom & {
    __typename?: 'Avventende';
    fom: Scalars['LocalDate'];
    tilrettelegging?: Maybe<Scalars['String']>;
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type BasePreviewSoknad = {
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    perioder: Array<Soknadsperiode>;
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type Behandler = {
    __typename?: 'Behandler';
    hprNummer?: Maybe<Scalars['String']>;
    navn: Scalars['String'];
    telefon?: Maybe<Scalars['String']>;
};

export type Behandlingsdager = FomTom & {
    __typename?: 'Behandlingsdager';
    behandlingsdager: Scalars['Int'];
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type Dialogmote = {
    __typename?: 'Dialogmote';
    id: Scalars['String'];
    tekst?: Maybe<Scalars['String']>;
};

export type FomTom = {
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
};

export enum FravarstypeEnum {
    Ferie = 'FERIE',
    Permisjon = 'PERMISJON',
    UtdanningDeltid = 'UTDANNING_DELTID',
    UtdanningFulltid = 'UTDANNING_FULLTID',
    Utlandsopphold = 'UTLANDSOPPHOLD',
}

export type Gradert = FomTom & {
    __typename?: 'Gradert';
    fom: Scalars['LocalDate'];
    grad: Scalars['Int'];
    reisetilskudd: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type Mutation = {
    __typename?: 'Mutation';
    read?: Maybe<Scalars['Boolean']>;
    unlinkSykmeldt?: Maybe<Scalars['Boolean']>;
};

export type MutationReadArgs = {
    id: Scalars['ID'];
    type: ReadType;
};

export type MutationUnlinkSykmeldtArgs = {
    sykmeldtId: Scalars['ID'];
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
    __typename?: 'PreviewFremtidigSoknad';
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    perioder: Array<Soknadsperiode>;
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type PreviewKorrigertSoknad = BasePreviewSoknad & {
    __typename?: 'PreviewKorrigertSoknad';
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    korrigererSoknadId: Scalars['String'];
    korrigertBySoknadId?: Maybe<Scalars['String']>;
    lest: Scalars['Boolean'];
    perioder: Array<Soknadsperiode>;
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type PreviewNySoknad = BasePreviewSoknad & {
    __typename?: 'PreviewNySoknad';
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    perioder: Array<Soknadsperiode>;
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
    varsel: Scalars['Boolean'];
};

export type PreviewSendtSoknad = BasePreviewSoknad & {
    __typename?: 'PreviewSendtSoknad';
    fom: Scalars['LocalDate'];
    id: Scalars['String'];
    korrigertBySoknadId?: Maybe<Scalars['String']>;
    lest: Scalars['Boolean'];
    perioder: Array<Soknadsperiode>;
    sendtDato: Scalars['LocalDateTime'];
    status: SoknadsstatusEnum;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type PreviewSoknad = PreviewFremtidigSoknad | PreviewKorrigertSoknad | PreviewNySoknad | PreviewSendtSoknad;

export type PreviewSykmelding = {
    __typename?: 'PreviewSykmelding';
    fom: Scalars['LocalDate'];
    id: Scalars['ID'];
    lest: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
    type: Scalars['String'];
};

export type PreviewSykmeldt = {
    __typename?: 'PreviewSykmeldt';
    dialogmoter: Array<Dialogmote>;
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
    __typename?: 'Query';
    mineSykmeldte?: Maybe<Array<PreviewSykmeldt>>;
    soknad?: Maybe<Soknad>;
    sykmelding?: Maybe<Sykmelding>;
    sykmeldinger: Array<Maybe<Sykmelding>>;
    virksomheter: Array<Virksomhet>;
};

export type QuerySoknadArgs = {
    soknadId: Scalars['ID'];
};

export type QuerySykmeldingArgs = {
    sykmeldingId: Scalars['ID'];
};

export type QuerySykmeldingerArgs = {
    sykmeldingIds: Array<Scalars['ID']>;
};

export enum ReadType {
    Hendelse = 'Hendelse',
    Soknad = 'Soknad',
    Sykmelding = 'Sykmelding',
}

export type Reisetilskudd = FomTom & {
    __typename?: 'Reisetilskudd';
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
    type: PeriodeEnum;
};

export type Soknad = {
    __typename?: 'Soknad';
    fnr: Scalars['String'];
    fom: Scalars['LocalDate'];
    fravar: Array<SoknadFravar>;
    id: Scalars['ID'];
    korrigererSoknadId?: Maybe<Scalars['String']>;
    korrigertBySoknadId?: Maybe<Scalars['String']>;
    lest: Scalars['Boolean'];
    navn: Scalars['String'];
    perioder: Array<Soknadsperiode>;
    sykmeldingId: Scalars['String'];
    tom: Scalars['LocalDate'];
};

export type SoknadFravar = {
    __typename?: 'SoknadFravar';
    fom: Scalars['String'];
    tom: Scalars['String'];
    type: FravarstypeEnum;
};

export type Soknadsperiode = FomTom & {
    __typename?: 'Soknadsperiode';
    fom: Scalars['LocalDate'];
    sykmeldingsgrad?: Maybe<Scalars['Int']>;
    sykmeldingstype: PeriodeEnum;
    tom: Scalars['LocalDate'];
};

export enum SoknadsstatusEnum {
    Fremtidig = 'FREMTIDIG',
    Korrigert = 'KORRIGERT',
    Ny = 'NY',
    Sendt = 'SENDT',
}

export type Sykmelding = {
    __typename?: 'Sykmelding';
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
    __typename?: 'Virksomhet';
    navn: Scalars['String'];
    orgnummer: Scalars['String'];
};

export type MarkSoknadReadMutationVariables = Exact<{
    soknadId: Scalars['ID'];
}>;

export type MarkSoknadReadMutation = { __typename?: 'Mutation'; read?: boolean | null };

export type MarkSykmeldingReadMutationVariables = Exact<{
    sykmeldingId: Scalars['ID'];
}>;

export type MarkSykmeldingReadMutation = { __typename?: 'Mutation'; read?: boolean | null };

export type MarkHendelseResolvedMutationVariables = Exact<{
    hendelseId: Scalars['ID'];
}>;

export type MarkHendelseResolvedMutation = { __typename?: 'Mutation'; read?: boolean | null };

export type SoknadFragment = {
    __typename?: 'Soknad';
    id: string;
    sykmeldingId: string;
    fnr: string;
    navn: string;
    fom: string;
    tom: string;
    lest: boolean;
    korrigertBySoknadId?: string | null;
    fravar: Array<{ __typename?: 'SoknadFravar'; fom: string; tom: string; type: FravarstypeEnum }>;
};

export type SoknadFravarFragment = { __typename?: 'SoknadFravar'; fom: string; tom: string; type: FravarstypeEnum };

export type SoknadperiodeFragment = {
    __typename?: 'Soknadsperiode';
    fom: string;
    tom: string;
    sykmeldingstype: PeriodeEnum;
    sykmeldingsgrad?: number | null;
};

export type SoknadByIdQueryVariables = Exact<{
    soknadId: Scalars['ID'];
}>;

export type SoknadByIdQuery = {
    __typename?: 'Query';
    soknad?: {
        __typename?: 'Soknad';
        id: string;
        sykmeldingId: string;
        fnr: string;
        navn: string;
        fom: string;
        tom: string;
        lest: boolean;
        korrigertBySoknadId?: string | null;
        fravar: Array<{ __typename?: 'SoknadFravar'; fom: string; tom: string; type: FravarstypeEnum }>;
    } | null;
};

export type SykmeldingFragment = {
    __typename?: 'Sykmelding';
    id: string;
    fnr: string;
    lest: boolean;
    navn: string;
    startdatoSykefravar: string;
    arbeidsforEtterPeriode?: boolean | null;
    tiltakArbeidsplassen?: string | null;
    arbeidsgiver: { __typename?: 'Arbeidsgiver'; navn?: string | null; yrke?: string | null };
    behandler: { __typename?: 'Behandler'; navn: string; telefon?: string | null };
    perioder: Array<
        | {
              __typename: 'AktivitetIkkeMulig';
              fom: string;
              tom: string;
              arbeidsrelatertArsak?: {
                  __typename?: 'ArbeidsrelatertArsak';
                  arsak: Array<ArbeidsrelatertArsakEnum>;
                  beskrivelse?: string | null;
              } | null;
          }
        | { __typename: 'Avventende'; fom: string; tom: string; tilrettelegging?: string | null }
        | { __typename: 'Behandlingsdager'; fom: string; tom: string; behandlingsdager: number }
        | { __typename: 'Gradert'; fom: string; tom: string; grad: number; reisetilskudd: boolean }
        | { __typename: 'Reisetilskudd'; fom: string; tom: string }
    >;
};

export type SykmeldingPeriode_AktivitetIkkeMulig_Fragment = {
    __typename: 'AktivitetIkkeMulig';
    fom: string;
    tom: string;
    arbeidsrelatertArsak?: {
        __typename?: 'ArbeidsrelatertArsak';
        arsak: Array<ArbeidsrelatertArsakEnum>;
        beskrivelse?: string | null;
    } | null;
};

export type SykmeldingPeriode_Avventende_Fragment = {
    __typename: 'Avventende';
    fom: string;
    tom: string;
    tilrettelegging?: string | null;
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
    __typename?: 'Query';
    sykmelding?: {
        __typename?: 'Sykmelding';
        id: string;
        fnr: string;
        lest: boolean;
        navn: string;
        startdatoSykefravar: string;
        arbeidsforEtterPeriode?: boolean | null;
        tiltakArbeidsplassen?: string | null;
        arbeidsgiver: { __typename?: 'Arbeidsgiver'; navn?: string | null; yrke?: string | null };
        behandler: { __typename?: 'Behandler'; navn: string; telefon?: string | null };
        perioder: Array<
            | {
                  __typename: 'AktivitetIkkeMulig';
                  fom: string;
                  tom: string;
                  arbeidsrelatertArsak?: {
                      __typename?: 'ArbeidsrelatertArsak';
                      arsak: Array<ArbeidsrelatertArsakEnum>;
                      beskrivelse?: string | null;
                  } | null;
              }
            | { __typename: 'Avventende'; fom: string; tom: string; tilrettelegging?: string | null }
            | { __typename: 'Behandlingsdager'; fom: string; tom: string; behandlingsdager: number }
            | { __typename: 'Gradert'; fom: string; tom: string; grad: number; reisetilskudd: boolean }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string }
        >;
    } | null;
};

export type SykmeldingerByIdsQueryVariables = Exact<{
    ids: Array<Scalars['ID']> | Scalars['ID'];
}>;

export type SykmeldingerByIdsQuery = {
    __typename?: 'Query';
    sykmeldinger: Array<{
        __typename?: 'Sykmelding';
        id: string;
        fnr: string;
        lest: boolean;
        navn: string;
        startdatoSykefravar: string;
        arbeidsforEtterPeriode?: boolean | null;
        tiltakArbeidsplassen?: string | null;
        arbeidsgiver: { __typename?: 'Arbeidsgiver'; navn?: string | null; yrke?: string | null };
        behandler: { __typename?: 'Behandler'; navn: string; telefon?: string | null };
        perioder: Array<
            | {
                  __typename: 'AktivitetIkkeMulig';
                  fom: string;
                  tom: string;
                  arbeidsrelatertArsak?: {
                      __typename?: 'ArbeidsrelatertArsak';
                      arsak: Array<ArbeidsrelatertArsakEnum>;
                      beskrivelse?: string | null;
                  } | null;
              }
            | { __typename: 'Avventende'; fom: string; tom: string; tilrettelegging?: string | null }
            | { __typename: 'Behandlingsdager'; fom: string; tom: string; behandlingsdager: number }
            | { __typename: 'Gradert'; fom: string; tom: string; grad: number; reisetilskudd: boolean }
            | { __typename: 'Reisetilskudd'; fom: string; tom: string }
        >;
    } | null>;
};

export type PreviewSykmeldingFragment = {
    __typename?: 'PreviewSykmelding';
    id: string;
    fom: string;
    tom: string;
    lest: boolean;
    type: string;
};

export type PreviewSoknad_PreviewFremtidigSoknad_Fragment = {
    __typename: 'PreviewFremtidigSoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
    perioder: Array<{
        __typename?: 'Soknadsperiode';
        fom: string;
        tom: string;
        sykmeldingstype: PeriodeEnum;
        sykmeldingsgrad?: number | null;
    }>;
};

export type PreviewSoknad_PreviewKorrigertSoknad_Fragment = {
    __typename: 'PreviewKorrigertSoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
    lest: boolean;
    korrigererSoknadId: string;
    korrigertBySoknadId?: string | null;
    perioder: Array<{
        __typename?: 'Soknadsperiode';
        fom: string;
        tom: string;
        sykmeldingstype: PeriodeEnum;
        sykmeldingsgrad?: number | null;
    }>;
};

export type PreviewSoknad_PreviewNySoknad_Fragment = {
    __typename: 'PreviewNySoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
    varsel: boolean;
    perioder: Array<{
        __typename?: 'Soknadsperiode';
        fom: string;
        tom: string;
        sykmeldingstype: PeriodeEnum;
        sykmeldingsgrad?: number | null;
    }>;
};

export type PreviewSoknad_PreviewSendtSoknad_Fragment = {
    __typename: 'PreviewSendtSoknad';
    id: string;
    sykmeldingId: string;
    fom: string;
    tom: string;
    lest: boolean;
    sendtDato: string;
    korrigertBySoknadId?: string | null;
    perioder: Array<{
        __typename?: 'Soknadsperiode';
        fom: string;
        tom: string;
        sykmeldingstype: PeriodeEnum;
        sykmeldingsgrad?: number | null;
    }>;
};

export type PreviewSoknadFragment =
    | PreviewSoknad_PreviewFremtidigSoknad_Fragment
    | PreviewSoknad_PreviewKorrigertSoknad_Fragment
    | PreviewSoknad_PreviewNySoknad_Fragment
    | PreviewSoknad_PreviewSendtSoknad_Fragment;

export type DialogmoteFragment = { __typename?: 'Dialogmote'; id: string; tekst?: string | null };

export type PreviewSykmeldtFragment = {
    __typename?: 'PreviewSykmeldt';
    fnr: string;
    navn: string;
    orgnummer: string;
    friskmeldt: boolean;
    narmestelederId: string;
    startdatoSykefravar: string;
    previewSykmeldinger: Array<{
        __typename?: 'PreviewSykmelding';
        id: string;
        fom: string;
        tom: string;
        lest: boolean;
        type: string;
    }>;
    previewSoknader: Array<
        | {
              __typename: 'PreviewFremtidigSoknad';
              id: string;
              sykmeldingId: string;
              fom: string;
              tom: string;
              perioder: Array<{
                  __typename?: 'Soknadsperiode';
                  fom: string;
                  tom: string;
                  sykmeldingstype: PeriodeEnum;
                  sykmeldingsgrad?: number | null;
              }>;
          }
        | {
              __typename: 'PreviewKorrigertSoknad';
              id: string;
              sykmeldingId: string;
              fom: string;
              tom: string;
              lest: boolean;
              korrigererSoknadId: string;
              korrigertBySoknadId?: string | null;
              perioder: Array<{
                  __typename?: 'Soknadsperiode';
                  fom: string;
                  tom: string;
                  sykmeldingstype: PeriodeEnum;
                  sykmeldingsgrad?: number | null;
              }>;
          }
        | {
              __typename: 'PreviewNySoknad';
              id: string;
              sykmeldingId: string;
              fom: string;
              tom: string;
              varsel: boolean;
              perioder: Array<{
                  __typename?: 'Soknadsperiode';
                  fom: string;
                  tom: string;
                  sykmeldingstype: PeriodeEnum;
                  sykmeldingsgrad?: number | null;
              }>;
          }
        | {
              __typename: 'PreviewSendtSoknad';
              id: string;
              sykmeldingId: string;
              fom: string;
              tom: string;
              lest: boolean;
              sendtDato: string;
              korrigertBySoknadId?: string | null;
              perioder: Array<{
                  __typename?: 'Soknadsperiode';
                  fom: string;
                  tom: string;
                  sykmeldingstype: PeriodeEnum;
                  sykmeldingsgrad?: number | null;
              }>;
          }
    >;
    dialogmoter: Array<{ __typename?: 'Dialogmote'; id: string; tekst?: string | null }>;
};

export type MineSykmeldteQueryVariables = Exact<{ [key: string]: never }>;

export type MineSykmeldteQuery = {
    __typename?: 'Query';
    mineSykmeldte?: Array<{
        __typename?: 'PreviewSykmeldt';
        fnr: string;
        navn: string;
        orgnummer: string;
        friskmeldt: boolean;
        narmestelederId: string;
        startdatoSykefravar: string;
        previewSykmeldinger: Array<{
            __typename?: 'PreviewSykmelding';
            id: string;
            fom: string;
            tom: string;
            lest: boolean;
            type: string;
        }>;
        previewSoknader: Array<
            | {
                  __typename: 'PreviewFremtidigSoknad';
                  id: string;
                  sykmeldingId: string;
                  fom: string;
                  tom: string;
                  perioder: Array<{
                      __typename?: 'Soknadsperiode';
                      fom: string;
                      tom: string;
                      sykmeldingstype: PeriodeEnum;
                      sykmeldingsgrad?: number | null;
                  }>;
              }
            | {
                  __typename: 'PreviewKorrigertSoknad';
                  id: string;
                  sykmeldingId: string;
                  fom: string;
                  tom: string;
                  lest: boolean;
                  korrigererSoknadId: string;
                  korrigertBySoknadId?: string | null;
                  perioder: Array<{
                      __typename?: 'Soknadsperiode';
                      fom: string;
                      tom: string;
                      sykmeldingstype: PeriodeEnum;
                      sykmeldingsgrad?: number | null;
                  }>;
              }
            | {
                  __typename: 'PreviewNySoknad';
                  id: string;
                  sykmeldingId: string;
                  fom: string;
                  tom: string;
                  varsel: boolean;
                  perioder: Array<{
                      __typename?: 'Soknadsperiode';
                      fom: string;
                      tom: string;
                      sykmeldingstype: PeriodeEnum;
                      sykmeldingsgrad?: number | null;
                  }>;
              }
            | {
                  __typename: 'PreviewSendtSoknad';
                  id: string;
                  sykmeldingId: string;
                  fom: string;
                  tom: string;
                  lest: boolean;
                  sendtDato: string;
                  korrigertBySoknadId?: string | null;
                  perioder: Array<{
                      __typename?: 'Soknadsperiode';
                      fom: string;
                      tom: string;
                      sykmeldingstype: PeriodeEnum;
                      sykmeldingsgrad?: number | null;
                  }>;
              }
        >;
        dialogmoter: Array<{ __typename?: 'Dialogmote'; id: string; tekst?: string | null }>;
    }> | null;
};

export type UnlinkSykmeldtMutationVariables = Exact<{
    sykmeldtId: Scalars['ID'];
}>;

export type UnlinkSykmeldtMutation = { __typename?: 'Mutation'; unlinkSykmeldt?: boolean | null };

export type VirksomheterQueryVariables = Exact<{ [key: string]: never }>;

export type VirksomheterQuery = {
    __typename?: 'Query';
    virksomheter: Array<{ __typename?: 'Virksomhet'; orgnummer: string; navn: string }>;
};

export const SoknadFravarFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SoknadFravar' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SoknadFravar' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SoknadFravarFragment, unknown>;
export const SoknadFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Soknad' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Soknad' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fnr' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lest' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'korrigertBySoknadId' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fravar' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'SoknadFravar' } }],
                        },
                    },
                ],
            },
        },
        ...SoknadFravarFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<SoknadFragment, unknown>;
export const SykmeldingPeriodeFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'SykmeldingPeriode' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Periode' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'FomTom' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AktivitetIkkeMulig' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'arbeidsrelatertArsak' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'Field', name: { kind: 'Name', value: 'arsak' } },
                                            { kind: 'Field', name: { kind: 'Name', value: 'beskrivelse' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Gradert' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'grad' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'reisetilskudd' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Avventende' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'tilrettelegging' } }],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Behandlingsdager' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'behandlingsdager' } }],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SykmeldingPeriodeFragment, unknown>;
export const SykmeldingFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Sykmelding' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Sykmelding' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fnr' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lest' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'startdatoSykefravar' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'arbeidsforEtterPeriode' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tiltakArbeidsplassen' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'arbeidsgiver' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'yrke' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'behandler' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'telefon' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'perioder' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SykmeldingPeriode' } },
                            ],
                        },
                    },
                ],
            },
        },
        ...SykmeldingPeriodeFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<SykmeldingFragment, unknown>;
export const PreviewSykmeldingFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'PreviewSykmelding' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PreviewSykmelding' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'lest' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<PreviewSykmeldingFragment, unknown>;
export const SoknadperiodeFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Soknadperiode' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Soknadsperiode' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingstype' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingsgrad' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<SoknadperiodeFragment, unknown>;
export const PreviewSoknadFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'PreviewSoknad' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PreviewSoknad' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'BasePreviewSoknad' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sykmeldingId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'fom' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'tom' } },
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'perioder' },
                                    selectionSet: {
                                        kind: 'SelectionSet',
                                        selections: [
                                            { kind: 'FragmentSpread', name: { kind: 'Name', value: 'Soknadperiode' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PreviewNySoknad' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'Field', name: { kind: 'Name', value: 'varsel' } }],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PreviewKorrigertSoknad' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'lest' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'korrigererSoknadId' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'korrigertBySoknadId' } },
                            ],
                        },
                    },
                    {
                        kind: 'InlineFragment',
                        typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PreviewSendtSoknad' } },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'lest' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'sendtDato' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'korrigertBySoknadId' } },
                            ],
                        },
                    },
                ],
            },
        },
        ...SoknadperiodeFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<PreviewSoknadFragment, unknown>;
export const DialogmoteFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'Dialogmote' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Dialogmote' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'tekst' } },
                ],
            },
        },
    ],
} as unknown as DocumentNode<DialogmoteFragment, unknown>;
export const PreviewSykmeldtFragmentDoc = {
    kind: 'Document',
    definitions: [
        {
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'PreviewSykmeldt' },
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PreviewSykmeldt' } },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    { kind: 'Field', name: { kind: 'Name', value: 'fnr' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'orgnummer' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'friskmeldt' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'narmestelederId' } },
                    { kind: 'Field', name: { kind: 'Name', value: 'startdatoSykefravar' } },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'previewSykmeldinger' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PreviewSykmelding' } },
                            ],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'previewSoknader' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'PreviewSoknad' } }],
                        },
                    },
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dialogmoter' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Dialogmote' } }],
                        },
                    },
                ],
            },
        },
        ...PreviewSykmeldingFragmentDoc.definitions,
        ...PreviewSoknadFragmentDoc.definitions,
        ...DialogmoteFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<PreviewSykmeldtFragment, unknown>;
export const MarkSoknadReadDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'MarkSoknadRead' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'soknadId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'read' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'type' },
                                value: { kind: 'EnumValue', value: 'Soknad' },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'soknadId' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<MarkSoknadReadMutation, MarkSoknadReadMutationVariables>;
export const MarkSykmeldingReadDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'MarkSykmeldingRead' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'sykmeldingId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'read' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'type' },
                                value: { kind: 'EnumValue', value: 'Sykmelding' },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'sykmeldingId' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<MarkSykmeldingReadMutation, MarkSykmeldingReadMutationVariables>;
export const MarkHendelseResolvedDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'MarkHendelseResolved' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'hendelseId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'read' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'type' },
                                value: { kind: 'EnumValue', value: 'Hendelse' },
                            },
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'id' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'hendelseId' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<MarkHendelseResolvedMutation, MarkHendelseResolvedMutationVariables>;
export const SoknadByIdDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'SoknadById' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'soknadId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'soknad' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'soknadId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'soknadId' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Soknad' } }],
                        },
                    },
                ],
            },
        },
        ...SoknadFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<SoknadByIdQuery, SoknadByIdQueryVariables>;
export const SykmeldingByIdDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'SykmeldingById' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'sykmeldingId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sykmelding' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'sykmeldingId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'sykmeldingId' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } }],
                        },
                    },
                ],
            },
        },
        ...SykmeldingFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<SykmeldingByIdQuery, SykmeldingByIdQueryVariables>;
export const SykmeldingerByIdsDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'SykmeldingerByIds' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } },
                    type: {
                        kind: 'NonNullType',
                        type: {
                            kind: 'ListType',
                            type: {
                                kind: 'NonNullType',
                                type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
                            },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sykmeldinger' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'sykmeldingIds' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } },
                            },
                        ],
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'Sykmelding' } }],
                        },
                    },
                ],
            },
        },
        ...SykmeldingFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<SykmeldingerByIdsQuery, SykmeldingerByIdsQueryVariables>;
export const MineSykmeldteDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'MineSykmeldte' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'mineSykmeldte' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'PreviewSykmeldt' } }],
                        },
                    },
                ],
            },
        },
        ...PreviewSykmeldtFragmentDoc.definitions,
    ],
} as unknown as DocumentNode<MineSykmeldteQuery, MineSykmeldteQueryVariables>;
export const UnlinkSykmeldtDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'mutation',
            name: { kind: 'Name', value: 'UnlinkSykmeldt' },
            variableDefinitions: [
                {
                    kind: 'VariableDefinition',
                    variable: { kind: 'Variable', name: { kind: 'Name', value: 'sykmeldtId' } },
                    type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
                },
            ],
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'unlinkSykmeldt' },
                        arguments: [
                            {
                                kind: 'Argument',
                                name: { kind: 'Name', value: 'sykmeldtId' },
                                value: { kind: 'Variable', name: { kind: 'Name', value: 'sykmeldtId' } },
                            },
                        ],
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<UnlinkSykmeldtMutation, UnlinkSykmeldtMutationVariables>;
export const VirksomheterDocument = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'Virksomheter' },
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'virksomheter' },
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                { kind: 'Field', name: { kind: 'Name', value: 'orgnummer' } },
                                { kind: 'Field', name: { kind: 'Name', value: 'navn' } },
                            ],
                        },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode<VirksomheterQuery, VirksomheterQueryVariables>;
