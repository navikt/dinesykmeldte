/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolverContextType } from './resolverTypes';
export type Maybe<T> = T | null;
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
    virksomheter: Array<Virksomhet>;
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
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    ID: ResolverTypeWrapper<Scalars['ID']>;
    LocalDate: ResolverTypeWrapper<Scalars['LocalDate']>;
    LocalDateTime: ResolverTypeWrapper<Scalars['LocalDateTime']>;
    PreviewSoknad: ResolverTypeWrapper<PreviewSoknad>;
    PreviewSykmelding: ResolverTypeWrapper<PreviewSykmelding>;
    PreviewSykmeldt: ResolverTypeWrapper<PreviewSykmeldt>;
    Query: ResolverTypeWrapper<{}>;
    String: ResolverTypeWrapper<Scalars['String']>;
    Virksomhet: ResolverTypeWrapper<Virksomhet>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
    Boolean: Scalars['Boolean'];
    ID: Scalars['ID'];
    LocalDate: Scalars['LocalDate'];
    LocalDateTime: Scalars['LocalDateTime'];
    PreviewSoknad: PreviewSoknad;
    PreviewSykmelding: PreviewSykmelding;
    PreviewSykmeldt: PreviewSykmeldt;
    Query: {};
    String: Scalars['String'];
    Virksomhet: Virksomhet;
}>;

export interface LocalDateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDate'], any> {
    name: 'LocalDate';
}

export interface LocalDateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDateTime'], any> {
    name: 'LocalDateTime';
}

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
    virksomheter?: Resolver<Array<ResolversTypes['Virksomhet']>, ParentType, ContextType>;
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
    LocalDate?: GraphQLScalarType;
    LocalDateTime?: GraphQLScalarType;
    PreviewSoknad?: PreviewSoknadResolvers<ContextType>;
    PreviewSykmelding?: PreviewSykmeldingResolvers<ContextType>;
    PreviewSykmeldt?: PreviewSykmeldtResolvers<ContextType>;
    Query?: QueryResolvers<ContextType>;
    Virksomhet?: VirksomhetResolvers<ContextType>;
}>;
