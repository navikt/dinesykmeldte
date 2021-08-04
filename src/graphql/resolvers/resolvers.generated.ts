/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
import { ViewerModel, ResolverContextType } from './resolverTypes';
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
};

export type Person = {
    __typename?: 'Person';
    uuid: Scalars['String'];
    fodselsNummer: Scalars['String'];
    navn: Scalars['String'];
};

export type Query = {
    __typename?: 'Query';
    viewer: Viewer;
    sykmeldinger: Array<Sykmelding>;
    dineSykmeldte: Array<Person>;
};

export type QuerySykmeldingerArgs = {
    personUuid: Scalars['String'];
};

export type QueryDineSykmeldteArgs = {
    virksomhet: Scalars['String'];
};

export type Sykmelding = {
    __typename?: 'Sykmelding';
    dato: Scalars['String'];
};

export type Viewer = {
    __typename?: 'Viewer';
    personNummer: Scalars['String'];
    virksomheter: Array<Virksomhet>;
};

export type Virksomhet = {
    __typename?: 'Virksomhet';
    uuid: Scalars['String'];
    navn: Scalars['String'];
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
    Person: ResolverTypeWrapper<Person>;
    String: ResolverTypeWrapper<Scalars['String']>;
    Query: ResolverTypeWrapper<{}>;
    Sykmelding: ResolverTypeWrapper<Sykmelding>;
    Viewer: ResolverTypeWrapper<ViewerModel>;
    Virksomhet: ResolverTypeWrapper<Virksomhet>;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
    Person: Person;
    String: Scalars['String'];
    Query: {};
    Sykmelding: Sykmelding;
    Viewer: ViewerModel;
    Virksomhet: Virksomhet;
    Boolean: Scalars['Boolean'];
}>;

export type PersonResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person'],
> = ResolversObject<{
    uuid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    fodselsNummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = ResolversObject<{
    viewer?: Resolver<ResolversTypes['Viewer'], ParentType, ContextType>;
    sykmeldinger?: Resolver<
        Array<ResolversTypes['Sykmelding']>,
        ParentType,
        ContextType,
        RequireFields<QuerySykmeldingerArgs, 'personUuid'>
    >;
    dineSykmeldte?: Resolver<
        Array<ResolversTypes['Person']>,
        ParentType,
        ContextType,
        RequireFields<QueryDineSykmeldteArgs, 'virksomhet'>
    >;
}>;

export type SykmeldingResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Sykmelding'] = ResolversParentTypes['Sykmelding'],
> = ResolversObject<{
    dato?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ViewerResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Viewer'] = ResolversParentTypes['Viewer'],
> = ResolversObject<{
    personNummer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    virksomheter?: Resolver<Array<ResolversTypes['Virksomhet']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VirksomhetResolvers<
    ContextType = ResolverContextType,
    ParentType extends ResolversParentTypes['Virksomhet'] = ResolversParentTypes['Virksomhet'],
> = ResolversObject<{
    uuid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    navn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ResolverContextType> = ResolversObject<{
    Person?: PersonResolvers<ContextType>;
    Query?: QueryResolvers<ContextType>;
    Sykmelding?: SykmeldingResolvers<ContextType>;
    Viewer?: ViewerResolvers<ContextType>;
    Virksomhet?: VirksomhetResolvers<ContextType>;
}>;
