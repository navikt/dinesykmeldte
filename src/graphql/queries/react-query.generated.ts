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
    virksomheter: Array<Virksomhet>;
};

export type Virksomhet = {
    __typename?: 'Virksomhet';
    uuid: Scalars['String'];
    navn: Scalars['String'];
};

export type DineSykmeldteQueryVariables = Exact<{ [key: string]: never }>;

export type DineSykmeldteQuery = { __typename?: 'Query' } & {
    dineSykmeldte: Array<{ __typename?: 'Person' } & Pick<Person, 'uuid' | 'navn' | 'fodselsNummer'>>;
};

export type SykmeldingerQueryVariables = Exact<{
    personUuid: Scalars['String'];
}>;

export type SykmeldingerQuery = { __typename?: 'Query' } & {
    sykmeldinger: Array<{ __typename?: 'Sykmelding' } & Pick<Sykmelding, 'dato'>>;
};

export type VirksomheterQueryVariables = Exact<{ [key: string]: never }>;

export type VirksomheterQuery = { __typename?: 'Query' } & {
    viewer: { __typename?: 'Viewer' } & {
        virksomheter: Array<{ __typename?: 'Virksomhet' } & Pick<Virksomhet, 'uuid' | 'navn'>>;
    };
};

export const DineSykmeldteDocument = `
    query DineSykmeldte {
  dineSykmeldte(virksomhet: "dummy") {
    uuid
    navn
    fodselsNummer
  }
}
    `;
export const useDineSykmeldteQuery = <TData = DineSykmeldteQuery, TError = Error>(
    variables?: DineSykmeldteQueryVariables,
    options?: UseQueryOptions<DineSykmeldteQuery, TError, TData>,
) =>
    useQuery<DineSykmeldteQuery, TError, TData>(
        ['DineSykmeldte', variables],
        fetcher<DineSykmeldteQuery, DineSykmeldteQueryVariables>(DineSykmeldteDocument, variables),
        options,
    );
useDineSykmeldteQuery.document = DineSykmeldteDocument;

useDineSykmeldteQuery.getKey = (variables?: DineSykmeldteQueryVariables) => ['DineSykmeldte', variables];

export const SykmeldingerDocument = `
    query Sykmeldinger($personUuid: String!) {
  sykmeldinger(personUuid: $personUuid) {
    dato
  }
}
    `;
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
      uuid
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
