/* eslint-disable */
import { useQuery, UseQueryOptions } from 'react-query';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
    return async (): Promise<TData> => {
        const res = await fetch('/syk/dinesykmeldte/api/graphql' as string, {
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
};

export type Query = {
    __typename?: 'Query';
    foo: Scalars['String'];
    qux: Scalars['String'];
};

export type QueryFooArgs = {
    baz?: Maybe<Scalars['String']>;
};

export type TestQueryQueryVariables = Exact<{
    baz: Scalars['String'];
}>;

export type TestQueryQuery = { __typename?: 'Query' } & Pick<Query, 'foo'>;

export type ArglessTestQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ArglessTestQueryQuery = { __typename?: 'Query' } & Pick<Query, 'qux'>;

export const TestQueryDocument = `
    query TestQuery($baz: String!) {
  foo(baz: $baz)
}
    `;
export const useTestQueryQuery = <TData = TestQueryQuery, TError = Error>(
    variables: TestQueryQueryVariables,
    options?: UseQueryOptions<TestQueryQuery, TError, TData>,
) =>
    useQuery<TestQueryQuery, TError, TData>(
        ['TestQuery', variables],
        fetcher<TestQueryQuery, TestQueryQueryVariables>(TestQueryDocument, variables),
        options,
    );
useTestQueryQuery.document = TestQueryDocument;

useTestQueryQuery.getKey = (variables: TestQueryQueryVariables) => ['TestQuery', variables];

export const ArglessTestQueryDocument = `
    query ArglessTestQuery {
  qux
}
    `;
export const useArglessTestQueryQuery = <TData = ArglessTestQueryQuery, TError = Error>(
    variables?: ArglessTestQueryQueryVariables,
    options?: UseQueryOptions<ArglessTestQueryQuery, TError, TData>,
) =>
    useQuery<ArglessTestQueryQuery, TError, TData>(
        ['ArglessTestQuery', variables],
        fetcher<ArglessTestQueryQuery, ArglessTestQueryQueryVariables>(ArglessTestQueryDocument, variables),
        options,
    );
useArglessTestQueryQuery.document = ArglessTestQueryDocument;

useArglessTestQueryQuery.getKey = (variables?: ArglessTestQueryQueryVariables) => ['ArglessTestQuery', variables];
