import { graphql } from 'graphql';
import { QueryClient, QueryKey } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { ExecutionResult } from 'graphql/execution/execute';
import { NextPageContext } from 'next';

import { PrefetchResults } from '../shared/types';
import { createResolverContextType } from '../auth/withAuthantication';
import { logger } from '../utils/logger';

import schema from './schema';
import { ResolverContextType } from './resolvers/resolverTypes';

type ServerFetcher = () => Promise<ExecutionResult<unknown, unknown>['data']>;

/**
 * Executes the provided document against the GraphQL schema. Errors are logged and ignored.
 * Only used by the prefetcher functions, don't use directly.
 */
function serverFetcher<Variables>(
    document: string,
    context: NextPageContext,
    variables?: Variables | undefined,
): ServerFetcher {
    return async () => {
        if (!context.req) {
            throw new Error('Missing request from next context');
        }

        const resolverContextType: ResolverContextType | null = createResolverContextType(context.req);
        if (!resolverContextType) {
            throw new Error('Illegal state: User not logged in during prefetch.');
        }

        const { data, errors } = await graphql(schema, document, undefined, resolverContextType, variables);

        errors?.forEach((it) => {
            logger.error(it);
        });

        if (errors?.length) {
            throw errors[0].originalError;
        }

        return data;
    };
}

interface ClientContextPair {
    client: QueryClient;
    context: NextPageContext;
}

/**
 * Prefetch a single query with variables
 */
async function prefetchQuery<Variables>(
    environment: ClientContextPair,
    query: { document: string; getKey: (variables: Variables) => QueryKey },
    variables: Variables,
): Promise<void>;

/**
 * Prefetch a single query without variables
 */
async function prefetchQuery(
    environment: ClientContextPair,
    query: { document: string; getKey: () => QueryKey },
): Promise<void>;

async function prefetchQuery<Variables>(
    environment: ClientContextPair,
    query: {
        document: string;
        getKey: (variables?: Variables) => QueryKey;
    },
    variables?: Variables,
): Promise<void> {
    const fetcher: ServerFetcher = await serverFetcher(query.document, environment.context, variables);

    await environment.client.prefetchQuery(query.getKey(variables), fetcher);
}

export type MultiPrefetcher = (environment: ClientContextPair) => Promise<void>;

/**
 * Create a prefetcher for a query with variables
 */
function createPrefetch<Variables>(
    query: { document: string; getKey: (variables: Variables) => QueryKey },
    variables: Variables,
): MultiPrefetcher;

/**
 * Create a prefetcher for a query without variables
 */
function createPrefetch(query: { document: string; getKey: () => QueryKey }): MultiPrefetcher;

function createPrefetch<Variables>(
    query: {
        document: string;
        getKey: (variables?: Variables) => QueryKey;
    },
    variables?: Variables,
): MultiPrefetcher {
    return (environment) => prefetchQuery(environment, query, variables);
}

/**
 * Will prefetch multiple queries. Use createPrefetch to create fetchers.
 * Failed prefetches are ignored and logged.
 */
async function prefetchMutlipleQueries(environment: ClientContextPair, queries: MultiPrefetcher[]): Promise<void> {
    await Promise.all(queries.map((it) => it(environment)));
}

/**
 * Wraps the prefetched QueryClient in the required props shape for a page
 * to be rehydrated with the prefetched ReactQuery state.
 */
export function wrapProps(queryClient: QueryClient): PrefetchResults {
    return {
        dehydratedState: dehydrate(queryClient),
    };
}

export { prefetchQuery, createPrefetch, prefetchMutlipleQueries };
