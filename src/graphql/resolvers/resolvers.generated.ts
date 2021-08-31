/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolverContextType } from './resolverTypes';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } &
    { [P in K]-?: NonNullable<T[P]> };
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
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

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
    Adresse: ResolverTypeWrapper<Adresse>;
    String: ResolverTypeWrapper<Scalars['String']>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
    AktivitetIkkeMulig: ResolverTypeWrapper<AktivitetIkkeMulig>;
    AnnenFraverGrunn: AnnenFraverGrunn;
    AnnenFraversArsak: ResolverTypeWrapper<AnnenFraversArsak>;
    Arbeidsgiver: ResolverTypeWrapper<Arbeidsgiver>;
    ArbeidsrelatertArsak: ResolverTypeWrapper<ArbeidsrelatertArsak>;
    ArbeidsrelatertArsakType: ArbeidsrelatertArsakType;
    AvsenderSystem: ResolverTypeWrapper<AvsenderSystem>;
    Behandler: ResolverTypeWrapper<Behandler>;
    Diagnose: ResolverTypeWrapper<Diagnose>;
    ErIArbeid: ResolverTypeWrapper<ErIArbeid>;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    ErIkkeIArbeid: ResolverTypeWrapper<ErIkkeIArbeid>;
    Gradert: ResolverTypeWrapper<Gradert>;
    HarArbeidsgiver: HarArbeidsgiver;
    KontaktMedPasient: ResolverTypeWrapper<KontaktMedPasient>;
    LocalDate: ResolverTypeWrapper<Scalars['LocalDate']>;
    LocalDateTime: ResolverTypeWrapper<Scalars['LocalDateTime']>;
    MedisinskArsak: ResolverTypeWrapper<MedisinskArsak>;
    MedisinskArsakType: MedisinskArsakType;
    MedisinskVurdering: ResolverTypeWrapper<MedisinskVurdering>;
    MeldingTilNAV: ResolverTypeWrapper<MeldingTilNav>;
    Periode: ResolverTypeWrapper<Periode>;
    Prognose: ResolverTypeWrapper<Prognose>;
    Query: ResolverTypeWrapper<{}>;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    Soknad: ResolverTypeWrapper<Soknad>;
    SporsmalSvar: ResolverTypeWrapper<SporsmalSvar>;
    SporsmalSvarOpplysninger: ResolverTypeWrapper<SporsmalSvarOpplysninger>;
    SvarRestriksjon: SvarRestriksjon;
    Sykmelding: ResolverTypeWrapper<Sykmelding>;
    Sykmeldt: ResolverTypeWrapper<Sykmeldt>;
    UtdypendeOpplysninger: ResolverTypeWrapper<UtdypendeOpplysninger>;
    Viewer: ResolverTypeWrapper<Viewer>;
    Virksomhet: ResolverTypeWrapper<Virksomhet>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
    Adresse: Adresse;
    String: Scalars['String'];
    Int: Scalars['Int'];
    AktivitetIkkeMulig: AktivitetIkkeMulig;
    AnnenFraversArsak: AnnenFraversArsak;
    Arbeidsgiver: Arbeidsgiver;
    ArbeidsrelatertArsak: ArbeidsrelatertArsak;
    AvsenderSystem: AvsenderSystem;
    Behandler: Behandler;
    Diagnose: Diagnose;
    ErIArbeid: ErIArbeid;
    Boolean: Scalars['Boolean'];
    ErIkkeIArbeid: ErIkkeIArbeid;
    Gradert: Gradert;
    KontaktMedPasient: KontaktMedPasient;
    LocalDate: Scalars['LocalDate'];
    LocalDateTime: Scalars['LocalDateTime'];
    MedisinskArsak: MedisinskArsak;
    MedisinskVurdering: MedisinskVurdering;
    MeldingTilNAV: MeldingTilNav;
    Periode: Periode;
    Prognose: Prognose;
    Query: {};
    ID: Scalars['ID'];
    Soknad: Soknad;
    SporsmalSvar: SporsmalSvar;
    SporsmalSvarOpplysninger: SporsmalSvarOpplysninger;
    Sykmelding: Sykmelding;
    Sykmeldt: Sykmeldt;
    UtdypendeOpplysninger: UtdypendeOpplysninger;
    Viewer: Viewer;
    Virksomhet: Virksomhet;
}>;

export type AdresseResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Adresse'] = ResolversParentTypes['Adresse'],
> = ResolversObject<{
    gate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    postnummer?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    kommune?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    postboks?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    land?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AktivitetIkkeMuligResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['AktivitetIkkeMulig'] = ResolversParentTypes['AktivitetIkkeMulig'],
> = ResolversObject<{
    medisinskArsak?: Resolver<Maybe<ResolversTypes['MedisinskArsak']>, ParentType, ContextType>;
    arbeidsrelatertArsak?: Resolver<Maybe<ResolversTypes['ArbeidsrelatertArsak']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnnenFraversArsakResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['AnnenFraversArsak'] = ResolversParentTypes['AnnenFraversArsak'],
> = ResolversObject<{
    beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    grunn?: Resolver<Array<ResolversTypes['AnnenFraverGrunn']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArbeidsgiverResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Arbeidsgiver'] = ResolversParentTypes['Arbeidsgiver'],
> = ResolversObject<{
    harArbeidsgiver?: Resolver<ResolversTypes['HarArbeidsgiver'], ParentType, ContextType>;
    navn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    yrkesbetegnelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    stillingsprosent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArbeidsrelatertArsakResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['ArbeidsrelatertArsak'] = ResolversParentTypes['ArbeidsrelatertArsak'],
> = ResolversObject<{
    beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    arsak?: Resolver<Array<ResolversTypes['ArbeidsrelatertArsakType']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AvsenderSystemResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['AvsenderSystem'] = ResolversParentTypes['AvsenderSystem'],
> = ResolversObject<{
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    versjon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BehandlerResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Behandler'] = ResolversParentTypes['Behandler'],
> = ResolversObject<{
    fornavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    mellomnavn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    etternavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    aktoerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    fnr?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    hpr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    her?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    adresse?: Resolver<ResolversTypes['Adresse'], ParentType, ContextType>;
    tlf?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DiagnoseResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Diagnose'] = ResolversParentTypes['Diagnose'],
> = ResolversObject<{
    system?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    kode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    tekst?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErIArbeidResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['ErIArbeid'] = ResolversParentTypes['ErIArbeid'],
> = ResolversObject<{
    egetArbeidPaSikt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    annetArbeidPaSikt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    arbeidFOM?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    vurderingsdato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErIkkeIArbeidResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['ErIkkeIArbeid'] = ResolversParentTypes['ErIkkeIArbeid'],
> = ResolversObject<{
    arbeidsforPaSikt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    arbeidsforFOM?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    vurderingsdato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GradertResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Gradert'] = ResolversParentTypes['Gradert'],
> = ResolversObject<{
    reisetilskudd?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    grad?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type KontaktMedPasientResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['KontaktMedPasient'] = ResolversParentTypes['KontaktMedPasient'],
> = ResolversObject<{
    kontaktDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    begrunnelseIkkeKontakt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface LocalDateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDate'], any> {
    name: 'LocalDate';
}

export interface LocalDateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDateTime'], any> {
    name: 'LocalDateTime';
}

export type MedisinskArsakResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['MedisinskArsak'] = ResolversParentTypes['MedisinskArsak'],
> = ResolversObject<{
    beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    arsak?: Resolver<Maybe<Array<Maybe<ResolversTypes['MedisinskArsakType']>>>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MedisinskVurderingResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['MedisinskVurdering'] = ResolversParentTypes['MedisinskVurdering'],
> = ResolversObject<{
    hovedDiagnose?: Resolver<Maybe<ResolversTypes['Diagnose']>, ParentType, ContextType>;
    biDiagnoser?: Resolver<Maybe<Array<Maybe<ResolversTypes['Diagnose']>>>, ParentType, ContextType>;
    svangerskap?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    yrkesskade?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    yrkesskadeDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    annenFraversArsak?: Resolver<Maybe<ResolversTypes['AnnenFraversArsak']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MeldingTilNavResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['MeldingTilNAV'] = ResolversParentTypes['MeldingTilNAV'],
> = ResolversObject<{
    bistandUmiddelbart?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    beskrivBistand?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PeriodeResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Periode'] = ResolversParentTypes['Periode'],
> = ResolversObject<{
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    aktivitetIkkeMulig?: Resolver<Maybe<ResolversTypes['AktivitetIkkeMulig']>, ParentType, ContextType>;
    avventendeInnspillTilArbeidsgiver?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    behandlingsdager?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    gradert?: Resolver<Maybe<ResolversTypes['Gradert']>, ParentType, ContextType>;
    reisetilskudd?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PrognoseResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Prognose'] = ResolversParentTypes['Prognose'],
> = ResolversObject<{
    arbeidsforEtterPeriode?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    hensynArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    erIArbeid?: Resolver<Maybe<ResolversTypes['ErIArbeid']>, ParentType, ContextType>;
    erIkkeIArbeid?: Resolver<Maybe<ResolversTypes['ErIkkeIArbeid']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = ResolversObject<{
    viewer?: Resolver<ResolversTypes['Viewer'], ParentType, ContextType>;
    virksomhet?: Resolver<
        Maybe<ResolversTypes['Virksomhet']>,
        ParentType,
        ContextType,
        RequireFields<QueryVirksomhetArgs, 'orgnummer'>
    >;
}>;

export type SoknadResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Soknad'] = ResolversParentTypes['Soknad'],
> = ResolversObject<{
    lest?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SporsmalSvarResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['SporsmalSvar'] = ResolversParentTypes['SporsmalSvar'],
> = ResolversObject<{
    sporsmal?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    svar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    restriksjoner?: Resolver<Array<ResolversTypes['SvarRestriksjon']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SporsmalSvarOpplysningerResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['SporsmalSvarOpplysninger'] = ResolversParentTypes['SporsmalSvarOpplysninger'],
> = ResolversObject<{
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    svar?: Resolver<ResolversTypes['SporsmalSvar'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SykmeldingResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Sykmelding'] = ResolversParentTypes['Sykmelding'],
> = ResolversObject<{
    id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    msgId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    pasientAktoerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    medisinskVurdering?: Resolver<ResolversTypes['MedisinskVurdering'], ParentType, ContextType>;
    skjermesForPasient?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    arbeidsgiver?: Resolver<ResolversTypes['Arbeidsgiver'], ParentType, ContextType>;
    perioder?: Resolver<Array<ResolversTypes['Periode']>, ParentType, ContextType>;
    prognose?: Resolver<ResolversTypes['Prognose'], ParentType, ContextType>;
    utdypendeOpplysninger?: Resolver<Array<ResolversTypes['UtdypendeOpplysninger']>, ParentType, ContextType>;
    tiltakArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    tiltakNAV?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    andreTiltak?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    meldingTilNAV?: Resolver<Maybe<ResolversTypes['MeldingTilNAV']>, ParentType, ContextType>;
    meldingTilArbeidsgiver?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    kontaktMedPasient?: Resolver<ResolversTypes['KontaktMedPasient'], ParentType, ContextType>;
    behandletTidspunkt?: Resolver<ResolversTypes['LocalDateTime'], ParentType, ContextType>;
    behandler?: Resolver<ResolversTypes['Behandler'], ParentType, ContextType>;
    avsenderSystem?: Resolver<ResolversTypes['AvsenderSystem'], ParentType, ContextType>;
    syketilfelleStartDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    signaturDato?: Resolver<ResolversTypes['LocalDateTime'], ParentType, ContextType>;
    navnFastlege?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SykmeldtResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Sykmeldt'] = ResolversParentTypes['Sykmeldt'],
> = ResolversObject<{
    uuid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    sykmeldinger?: Resolver<Array<ResolversTypes['Sykmelding']>, ParentType, ContextType>;
    soknader?: Resolver<Array<ResolversTypes['Soknad']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UtdypendeOpplysningerResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['UtdypendeOpplysninger'] = ResolversParentTypes['UtdypendeOpplysninger'],
> = ResolversObject<{
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    opplysninger?: Resolver<Array<ResolversTypes['SporsmalSvarOpplysninger']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ViewerResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Viewer'] = ResolversParentTypes['Viewer'],
> = ResolversObject<{
    virksomheter?: Resolver<Maybe<Array<ResolversTypes['Virksomhet']>>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VirksomhetResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Virksomhet'] = ResolversParentTypes['Virksomhet'],
> = ResolversObject<{
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    sykmeldte?: Resolver<Maybe<Array<ResolversTypes['Sykmeldt']>>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ResolverContextType> = ResolversObject<{
    Adresse?: AdresseResolvers<ContextType>;
    AktivitetIkkeMulig?: AktivitetIkkeMuligResolvers<ContextType>;
    AnnenFraversArsak?: AnnenFraversArsakResolvers<ContextType>;
    Arbeidsgiver?: ArbeidsgiverResolvers<ContextType>;
    ArbeidsrelatertArsak?: ArbeidsrelatertArsakResolvers<ContextType>;
    AvsenderSystem?: AvsenderSystemResolvers<ContextType>;
    Behandler?: BehandlerResolvers<ContextType>;
    Diagnose?: DiagnoseResolvers<ContextType>;
    ErIArbeid?: ErIArbeidResolvers<ContextType>;
    ErIkkeIArbeid?: ErIkkeIArbeidResolvers<ContextType>;
    Gradert?: GradertResolvers<ContextType>;
    KontaktMedPasient?: KontaktMedPasientResolvers<ContextType>;
    LocalDate?: GraphQLScalarType;
    LocalDateTime?: GraphQLScalarType;
    MedisinskArsak?: MedisinskArsakResolvers<ContextType>;
    MedisinskVurdering?: MedisinskVurderingResolvers<ContextType>;
    MeldingTilNAV?: MeldingTilNavResolvers<ContextType>;
    Periode?: PeriodeResolvers<ContextType>;
    Prognose?: PrognoseResolvers<ContextType>;
    Query?: QueryResolvers<ContextType>;
    Soknad?: SoknadResolvers<ContextType>;
    SporsmalSvar?: SporsmalSvarResolvers<ContextType>;
    SporsmalSvarOpplysninger?: SporsmalSvarOpplysningerResolvers<ContextType>;
    Sykmelding?: SykmeldingResolvers<ContextType>;
    Sykmeldt?: SykmeldtResolvers<ContextType>;
    UtdypendeOpplysninger?: UtdypendeOpplysningerResolvers<ContextType>;
    Viewer?: ViewerResolvers<ContextType>;
    Virksomhet?: VirksomhetResolvers<ContextType>;
}>;
