/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolverContextType } from './resolverTypes';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & {
    [P in K]-?: NonNullable<T[P]>;
};
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
    __typename?: 'AktivitetIkkeMulig';
    arbeidsrelatertArsak?: Maybe<ArbeidsrelatertArsak>;
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
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

export type Avventende = {
    __typename?: 'Avventende';
    fom: Scalars['LocalDate'];
    tilrettelegging?: Maybe<Scalars['String']>;
    tom: Scalars['LocalDate'];
};

export type Behandler = {
    __typename?: 'Behandler';
    hprNummer?: Maybe<Scalars['String']>;
    navn: Scalars['String'];
    telefon?: Maybe<Scalars['String']>;
};

export type Behandlingsdager = {
    __typename?: 'Behandlingsdager';
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
};

export type Gradert = {
    __typename?: 'Gradert';
    fom: Scalars['LocalDate'];
    grad: Scalars['Int'];
    reisetilskudd: Scalars['Boolean'];
    tom: Scalars['LocalDate'];
};

export type Periode = AktivitetIkkeMulig | Avventende | Behandlingsdager | Gradert | Reisetilskudd;

export type PreviewSoknad = {
    __typename?: 'PreviewSoknad';
    fom?: Maybe<Scalars['LocalDate']>;
    id: Scalars['ID'];
    lest: Scalars['Boolean'];
    sendtDato?: Maybe<Scalars['LocalDate']>;
    status: Scalars['String'];
    sykmeldingId?: Maybe<Scalars['String']>;
    tom?: Maybe<Scalars['LocalDate']>;
};

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
    virksomheter: Array<Virksomhet>;
};

export type QuerySoknadArgs = {
    soknadId: Scalars['ID'];
};

export type QuerySykmeldingArgs = {
    sykmeldingId: Scalars['ID'];
};

export type Reisetilskudd = {
    __typename?: 'Reisetilskudd';
    fom: Scalars['LocalDate'];
    tom: Scalars['LocalDate'];
};

export type Soknad = {
    __typename?: 'Soknad';
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
    __typename?: 'SoknadDetails';
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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
    | ResolverFn<TResult, TParent, TContext, TArgs>
    | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
    | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
    | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
    | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
    AktivitetIkkeMulig: ResolverTypeWrapper<AktivitetIkkeMulig>;
    Arbeidsgiver: ResolverTypeWrapper<Arbeidsgiver>;
    ArbeidsrelatertArsak: ResolverTypeWrapper<ArbeidsrelatertArsak>;
    ArbeidsrelatertArsakEnum: ArbeidsrelatertArsakEnum;
    Avventende: ResolverTypeWrapper<Avventende>;
    Behandler: ResolverTypeWrapper<Behandler>;
    Behandlingsdager: ResolverTypeWrapper<Behandlingsdager>;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    Gradert: ResolverTypeWrapper<Gradert>;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
    LocalDate: ResolverTypeWrapper<Scalars['LocalDate']>;
    LocalDateTime: ResolverTypeWrapper<Scalars['LocalDateTime']>;
    Periode:
        | ResolversTypes['AktivitetIkkeMulig']
        | ResolversTypes['Avventende']
        | ResolversTypes['Behandlingsdager']
        | ResolversTypes['Gradert']
        | ResolversTypes['Reisetilskudd'];
    PreviewSoknad: ResolverTypeWrapper<PreviewSoknad>;
    PreviewSykmelding: ResolverTypeWrapper<PreviewSykmelding>;
    PreviewSykmeldt: ResolverTypeWrapper<PreviewSykmeldt>;
    Query: ResolverTypeWrapper<{}>;
    Reisetilskudd: ResolverTypeWrapper<Reisetilskudd>;
    Soknad: ResolverTypeWrapper<Soknad>;
    SoknadDetails: ResolverTypeWrapper<SoknadDetails>;
    SoknadsstatusEnum: SoknadsstatusEnum;
    SoknadstypeEnum: SoknadstypeEnum;
    String: ResolverTypeWrapper<Scalars['String']>;
    Sykmelding: ResolverTypeWrapper<Omit<Sykmelding, 'perioder'> & { perioder: Array<ResolversTypes['Periode']> }>;
    Virksomhet: ResolverTypeWrapper<Virksomhet>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
    AktivitetIkkeMulig: AktivitetIkkeMulig;
    Arbeidsgiver: Arbeidsgiver;
    ArbeidsrelatertArsak: ArbeidsrelatertArsak;
    Avventende: Avventende;
    Behandler: Behandler;
    Behandlingsdager: Behandlingsdager;
    Boolean: Scalars['Boolean'];
    Gradert: Gradert;
    ID: Scalars['ID'];
    Int: Scalars['Int'];
    LocalDate: Scalars['LocalDate'];
    LocalDateTime: Scalars['LocalDateTime'];
    Periode:
        | ResolversParentTypes['AktivitetIkkeMulig']
        | ResolversParentTypes['Avventende']
        | ResolversParentTypes['Behandlingsdager']
        | ResolversParentTypes['Gradert']
        | ResolversParentTypes['Reisetilskudd'];
    PreviewSoknad: PreviewSoknad;
    PreviewSykmelding: PreviewSykmelding;
    PreviewSykmeldt: PreviewSykmeldt;
    Query: {};
    Reisetilskudd: Reisetilskudd;
    Soknad: Soknad;
    SoknadDetails: SoknadDetails;
    String: Scalars['String'];
    Sykmelding: Omit<Sykmelding, 'perioder'> & { perioder: Array<ResolversParentTypes['Periode']> };
    Virksomhet: Virksomhet;
}>;

export type AktivitetIkkeMuligResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['AktivitetIkkeMulig'] = ResolversParentTypes['AktivitetIkkeMulig'],
> = ResolversObject<{
    arbeidsrelatertArsak?: Resolver<Maybe<ResolversTypes['ArbeidsrelatertArsak']>, ParentType, ContextType>;
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArbeidsgiverResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Arbeidsgiver'] = ResolversParentTypes['Arbeidsgiver'],
> = ResolversObject<{
    navn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    yrke?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArbeidsrelatertArsakResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['ArbeidsrelatertArsak'] = ResolversParentTypes['ArbeidsrelatertArsak'],
> = ResolversObject<{
    arsak?: Resolver<Array<ResolversTypes['ArbeidsrelatertArsakEnum']>, ParentType, ContextType>;
    beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AvventendeResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Avventende'] = ResolversParentTypes['Avventende'],
> = ResolversObject<{
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    tilrettelegging?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BehandlerResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Behandler'] = ResolversParentTypes['Behandler'],
> = ResolversObject<{
    hprNummer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    telefon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BehandlingsdagerResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Behandlingsdager'] = ResolversParentTypes['Behandlingsdager'],
> = ResolversObject<{
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GradertResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Gradert'] = ResolversParentTypes['Gradert'],
> = ResolversObject<{
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    grad?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    reisetilskudd?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface LocalDateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDate'], any> {
    name: 'LocalDate';
}

export interface LocalDateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDateTime'], any> {
    name: 'LocalDateTime';
}

export type PeriodeResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Periode'] = ResolversParentTypes['Periode'],
> = ResolversObject<{
    __resolveType: TypeResolveFn<
        'AktivitetIkkeMulig' | 'Avventende' | 'Behandlingsdager' | 'Gradert' | 'Reisetilskudd',
        ParentType,
        ContextType
    >;
}>;

export type PreviewSoknadResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['PreviewSoknad'] = ResolversParentTypes['PreviewSoknad'],
> = ResolversObject<{
    fom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    lest?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    sendtDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    sykmeldingId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    tom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PreviewSykmeldingResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['PreviewSykmelding'] = ResolversParentTypes['PreviewSykmelding'],
> = ResolversObject<{
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    lest?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PreviewSykmeldtResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['PreviewSykmeldt'] = ResolversParentTypes['PreviewSykmeldt'],
> = ResolversObject<{
    fnr?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    friskmeldt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    narmestelederId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    previewSoknader?: Resolver<Array<ResolversTypes['PreviewSoknad']>, ParentType, ContextType>;
    previewSykmeldinger?: Resolver<Array<ResolversTypes['PreviewSykmelding']>, ParentType, ContextType>;
    startdatoSykefravar?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = ResolversObject<{
    mineSykmeldte?: Resolver<Maybe<Array<ResolversTypes['PreviewSykmeldt']>>, ParentType, ContextType>;
    soknad?: Resolver<
        Maybe<ResolversTypes['Soknad']>,
        ParentType,
        ContextType,
        RequireFields<QuerySoknadArgs, 'soknadId'>
    >;
    sykmelding?: Resolver<
        Maybe<ResolversTypes['Sykmelding']>,
        ParentType,
        ContextType,
        RequireFields<QuerySykmeldingArgs, 'sykmeldingId'>
    >;
    virksomheter?: Resolver<Array<ResolversTypes['Virksomhet']>, ParentType, ContextType>;
}>;

export type ReisetilskuddResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Reisetilskudd'] = ResolversParentTypes['Reisetilskudd'],
> = ResolversObject<{
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SoknadResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Soknad'] = ResolversParentTypes['Soknad'],
> = ResolversObject<{
    details?: Resolver<ResolversTypes['SoknadDetails'], ParentType, ContextType>;
    fnr?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    lest?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    sendtDato?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    sykmeldingId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SoknadDetailsResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['SoknadDetails'] = ResolversParentTypes['SoknadDetails'],
> = ResolversObject<{
    status?: Resolver<ResolversTypes['SoknadsstatusEnum'], ParentType, ContextType>;
    type?: Resolver<ResolversTypes['SoknadstypeEnum'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SykmeldingResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Sykmelding'] = ResolversParentTypes['Sykmelding'],
> = ResolversObject<{
    arbeidsforEtterPeriode?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
    arbeidsgiver?: Resolver<ResolversTypes['Arbeidsgiver'], ParentType, ContextType>;
    behandler?: Resolver<ResolversTypes['Behandler'], ParentType, ContextType>;
    fnr?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    hensynArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    innspillArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    kontaktDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    lest?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    perioder?: Resolver<Array<ResolversTypes['Periode']>, ParentType, ContextType>;
    startdatoSykefravar?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    tiltakArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VirksomhetResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Virksomhet'] = ResolversParentTypes['Virksomhet'],
> = ResolversObject<{
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ResolverContextType> = ResolversObject<{
    AktivitetIkkeMulig?: AktivitetIkkeMuligResolvers<ContextType>;
    Arbeidsgiver?: ArbeidsgiverResolvers<ContextType>;
    ArbeidsrelatertArsak?: ArbeidsrelatertArsakResolvers<ContextType>;
    Avventende?: AvventendeResolvers<ContextType>;
    Behandler?: BehandlerResolvers<ContextType>;
    Behandlingsdager?: BehandlingsdagerResolvers<ContextType>;
    Gradert?: GradertResolvers<ContextType>;
    LocalDate?: GraphQLScalarType;
    LocalDateTime?: GraphQLScalarType;
    Periode?: PeriodeResolvers<ContextType>;
    PreviewSoknad?: PreviewSoknadResolvers<ContextType>;
    PreviewSykmelding?: PreviewSykmeldingResolvers<ContextType>;
    PreviewSykmeldt?: PreviewSykmeldtResolvers<ContextType>;
    Query?: QueryResolvers<ContextType>;
    Reisetilskudd?: ReisetilskuddResolvers<ContextType>;
    Soknad?: SoknadResolvers<ContextType>;
    SoknadDetails?: SoknadDetailsResolvers<ContextType>;
    Sykmelding?: SykmeldingResolvers<ContextType>;
    Virksomhet?: VirksomhetResolvers<ContextType>;
}>;
