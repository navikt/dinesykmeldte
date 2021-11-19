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
    LocalDate: any;
    LocalDateTime: any;
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

export type PreviewSykmeldingFragment = {
    __typename?: 'PreviewSykmelding';
    id: string;
    fom: any;
    tom: any;
    lest: boolean;
    type: string;
};

export type PreviewSoknadFragment = {
    __typename?: 'PreviewSoknad';
    id: string;
    fom?: any | null | undefined;
    tom?: any | null | undefined;
    lest: boolean;
    status: string;
    sendtDato?: any | null | undefined;
    sykmeldingId?: string | null | undefined;
};

export type PreviewSykmeldtFragment = {
    __typename?: 'PreviewSykmeldt';
    fnr: string;
    navn: string;
    orgnummer: string;
    friskmeldt: boolean;
    narmestelederId: string;
    startdatoSykefravar: any;
    previewSykmeldinger: Array<{
        __typename?: 'PreviewSykmelding';
        id: string;
        fom: any;
        tom: any;
        lest: boolean;
        type: string;
    }>;
    previewSoknader: Array<{
        __typename?: 'PreviewSoknad';
        id: string;
        fom?: any | null | undefined;
        tom?: any | null | undefined;
        lest: boolean;
        status: string;
        sendtDato?: any | null | undefined;
        sykmeldingId?: string | null | undefined;
    }>;
};

export type MineSykmeldteQueryVariables = Exact<{ [key: string]: never }>;

export type MineSykmeldteQuery = {
    __typename?: 'Query';
    mineSykmeldte?:
        | Array<{
              __typename?: 'PreviewSykmeldt';
              fnr: string;
              navn: string;
              orgnummer: string;
              friskmeldt: boolean;
              narmestelederId: string;
              startdatoSykefravar: any;
              previewSykmeldinger: Array<{
                  __typename?: 'PreviewSykmelding';
                  id: string;
                  fom: any;
                  tom: any;
                  lest: boolean;
                  type: string;
              }>;
              previewSoknader: Array<{
                  __typename?: 'PreviewSoknad';
                  id: string;
                  fom?: any | null | undefined;
                  tom?: any | null | undefined;
                  lest: boolean;
                  status: string;
                  sendtDato?: any | null | undefined;
                  sykmeldingId?: string | null | undefined;
              }>;
          }>
        | null
        | undefined;
};

export type VirksomheterQueryVariables = Exact<{ [key: string]: never }>;

export type VirksomheterQuery = {
    __typename?: 'Query';
    virksomheter: Array<{ __typename?: 'Virksomhet'; orgnummer: string; navn: string }>;
};

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
