/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolverContextType } from './resolverTypes';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
    AktivitetIkkeMulig: ResolverTypeWrapper<AktivitetIkkeMulig>;
    AnnenFraverGrunn: AnnenFraverGrunn;
    AnnenFraversArsak: ResolverTypeWrapper<AnnenFraversArsak>;
    Arbeidsgiver: ResolverTypeWrapper<Arbeidsgiver>;
    ArbeidsrelatertArsak: ResolverTypeWrapper<ArbeidsrelatertArsak>;
    ArbeidsrelatertArsakType: ArbeidsrelatertArsakType;
    AvsenderSystem: ResolverTypeWrapper<AvsenderSystem>;
    Behandler: ResolverTypeWrapper<Behandler>;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    Diagnose: ResolverTypeWrapper<Diagnose>;
    ErIArbeid: ResolverTypeWrapper<ErIArbeid>;
    ErIkkeIArbeid: ResolverTypeWrapper<ErIkkeIArbeid>;
    Gradert: ResolverTypeWrapper<Gradert>;
    HarArbeidsgiver: HarArbeidsgiver;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    Int: ResolverTypeWrapper<Scalars['Int']>;
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
    Soknad: ResolverTypeWrapper<Soknad>;
    SporsmalSvar: ResolverTypeWrapper<SporsmalSvar>;
    SporsmalSvarOpplysninger: ResolverTypeWrapper<SporsmalSvarOpplysninger>;
    String: ResolverTypeWrapper<Scalars['String']>;
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
    AktivitetIkkeMulig: AktivitetIkkeMulig;
    AnnenFraversArsak: AnnenFraversArsak;
    Arbeidsgiver: Arbeidsgiver;
    ArbeidsrelatertArsak: ArbeidsrelatertArsak;
    AvsenderSystem: AvsenderSystem;
    Behandler: Behandler;
    Boolean: Scalars['Boolean'];
    Diagnose: Diagnose;
    ErIArbeid: ErIArbeid;
    ErIkkeIArbeid: ErIkkeIArbeid;
    Gradert: Gradert;
    ID: Scalars['ID'];
    Int: Scalars['Int'];
    KontaktMedPasient: KontaktMedPasient;
    LocalDate: Scalars['LocalDate'];
    LocalDateTime: Scalars['LocalDateTime'];
    MedisinskArsak: MedisinskArsak;
    MedisinskVurdering: MedisinskVurdering;
    MeldingTilNAV: MeldingTilNav;
    Periode: Periode;
    Prognose: Prognose;
    Query: {};
    Soknad: Soknad;
    SporsmalSvar: SporsmalSvar;
    SporsmalSvarOpplysninger: SporsmalSvarOpplysninger;
    String: Scalars['String'];
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
    kommune?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    land?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    postboks?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    postnummer?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AktivitetIkkeMuligResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['AktivitetIkkeMulig'] = ResolversParentTypes['AktivitetIkkeMulig'],
> = ResolversObject<{
    arbeidsrelatertArsak?: Resolver<Maybe<ResolversTypes['ArbeidsrelatertArsak']>, ParentType, ContextType>;
    medisinskArsak?: Resolver<Maybe<ResolversTypes['MedisinskArsak']>, ParentType, ContextType>;
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
    stillingsprosent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    yrkesbetegnelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArbeidsrelatertArsakResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['ArbeidsrelatertArsak'] = ResolversParentTypes['ArbeidsrelatertArsak'],
> = ResolversObject<{
    arsak?: Resolver<Array<ResolversTypes['ArbeidsrelatertArsakType']>, ParentType, ContextType>;
    beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
    adresse?: Resolver<ResolversTypes['Adresse'], ParentType, ContextType>;
    aktoerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    etternavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    fnr?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    fornavn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    her?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    hpr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    mellomnavn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    tlf?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DiagnoseResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Diagnose'] = ResolversParentTypes['Diagnose'],
> = ResolversObject<{
    kode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    system?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    tekst?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErIArbeidResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['ErIArbeid'] = ResolversParentTypes['ErIArbeid'],
> = ResolversObject<{
    annetArbeidPaSikt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    arbeidFOM?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    egetArbeidPaSikt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    vurderingsdato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErIkkeIArbeidResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['ErIkkeIArbeid'] = ResolversParentTypes['ErIkkeIArbeid'],
> = ResolversObject<{
    arbeidsforFOM?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    arbeidsforPaSikt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    vurderingsdato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GradertResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Gradert'] = ResolversParentTypes['Gradert'],
> = ResolversObject<{
    grad?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    reisetilskudd?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type KontaktMedPasientResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['KontaktMedPasient'] = ResolversParentTypes['KontaktMedPasient'],
> = ResolversObject<{
    begrunnelseIkkeKontakt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    kontaktDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
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
    arsak?: Resolver<Maybe<Array<Maybe<ResolversTypes['MedisinskArsakType']>>>, ParentType, ContextType>;
    beskrivelse?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MedisinskVurderingResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['MedisinskVurdering'] = ResolversParentTypes['MedisinskVurdering'],
> = ResolversObject<{
    annenFraversArsak?: Resolver<Maybe<ResolversTypes['AnnenFraversArsak']>, ParentType, ContextType>;
    biDiagnoser?: Resolver<Maybe<Array<Maybe<ResolversTypes['Diagnose']>>>, ParentType, ContextType>;
    hovedDiagnose?: Resolver<Maybe<ResolversTypes['Diagnose']>, ParentType, ContextType>;
    svangerskap?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    yrkesskade?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    yrkesskadeDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MeldingTilNavResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['MeldingTilNAV'] = ResolversParentTypes['MeldingTilNAV'],
> = ResolversObject<{
    beskrivBistand?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    bistandUmiddelbart?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PeriodeResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Periode'] = ResolversParentTypes['Periode'],
> = ResolversObject<{
    aktivitetIkkeMulig?: Resolver<Maybe<ResolversTypes['AktivitetIkkeMulig']>, ParentType, ContextType>;
    avventendeInnspillTilArbeidsgiver?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    behandlingsdager?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    fom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    gradert?: Resolver<Maybe<ResolversTypes['Gradert']>, ParentType, ContextType>;
    reisetilskudd?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    tom?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PrognoseResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Prognose'] = ResolversParentTypes['Prognose'],
> = ResolversObject<{
    arbeidsforEtterPeriode?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    erIArbeid?: Resolver<Maybe<ResolversTypes['ErIArbeid']>, ParentType, ContextType>;
    erIkkeIArbeid?: Resolver<Maybe<ResolversTypes['ErIkkeIArbeid']>, ParentType, ContextType>;
    hensynArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    lest?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SporsmalSvarResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['SporsmalSvar'] = ResolversParentTypes['SporsmalSvar'],
> = ResolversObject<{
    restriksjoner?: Resolver<Array<ResolversTypes['SvarRestriksjon']>, ParentType, ContextType>;
    sporsmal?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    svar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
    andreTiltak?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    arbeidsgiver?: Resolver<ResolversTypes['Arbeidsgiver'], ParentType, ContextType>;
    avsenderSystem?: Resolver<ResolversTypes['AvsenderSystem'], ParentType, ContextType>;
    behandler?: Resolver<ResolversTypes['Behandler'], ParentType, ContextType>;
    behandletTidspunkt?: Resolver<ResolversTypes['LocalDateTime'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    kontaktMedPasient?: Resolver<ResolversTypes['KontaktMedPasient'], ParentType, ContextType>;
    medisinskVurdering?: Resolver<ResolversTypes['MedisinskVurdering'], ParentType, ContextType>;
    meldingTilArbeidsgiver?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    meldingTilNAV?: Resolver<Maybe<ResolversTypes['MeldingTilNAV']>, ParentType, ContextType>;
    msgId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    navnFastlege?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    pasientAktoerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    perioder?: Resolver<Array<ResolversTypes['Periode']>, ParentType, ContextType>;
    prognose?: Resolver<ResolversTypes['Prognose'], ParentType, ContextType>;
    signaturDato?: Resolver<ResolversTypes['LocalDateTime'], ParentType, ContextType>;
    skjermesForPasient?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    syketilfelleStartDato?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
    tiltakArbeidsplassen?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    tiltakNAV?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    utdypendeOpplysninger?: Resolver<Array<ResolversTypes['UtdypendeOpplysninger']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SykmeldtResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Sykmeldt'] = ResolversParentTypes['Sykmeldt'],
> = ResolversObject<{
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    soknader?: Resolver<Array<ResolversTypes['Soknad']>, ParentType, ContextType>;
    sykmeldinger?: Resolver<Array<ResolversTypes['Sykmelding']>, ParentType, ContextType>;
    uuid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    orgnummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
