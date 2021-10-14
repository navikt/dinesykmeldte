import { graphql } from 'graphql';
import { QueryClient, QueryKey } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { ExecutionResult } from 'graphql/execution/execute';
import { NextPageContext } from 'next';

import { PrefetchResults } from '../shared/types';
import { createResolverContextType } from '../auth/withAuthantication';
import { logger } from '../utils/logger';

import { schema } from './schema';
import { ResolverContextType } from './resolvers/resolverTypes';

function serverFetcher(
    document: string,
    context: NextPageContext,
    variables?: Record<string, unknown>,
): () => Promise<ExecutionResult['data']> {
    return async () => {
        if (!context.req) {
            throw new Error('Missing request from next context');
        }

        const resolverContextType: ResolverContextType | null = createResolverContextType(context.req);
        if (!resolverContextType) {
            throw new Error('Illegal state: User not logged in during prefetch.');
        }

        const result = await graphql(schema, document, undefined, resolverContextType, variables);

        return result.data;
    };
}

export function wrapProps(queryClient: QueryClient): PrefetchResults {
    return {
        dehydratedState: dehydrate(queryClient),
    };
}

interface ClientContextPair {
    client: QueryClient;
    context: NextPageContext;
}

async function queryPrefetcher<Variables>(
    environment: ClientContextPair,
    query: { document: string; getKey: (variables: Variables) => QueryKey },
    variables: Variables,
): Promise<void>;
async function queryPrefetcher(
    environment: ClientContextPair,
    query: { document: string; getKey: (noVariables: Record<string, never>) => QueryKey },
): Promise<void>;
async function queryPrefetcher<Variables>(
    environment: ClientContextPair,
    query: {
        document: string;
        getKey: ((variables?: Variables) => QueryKey) & ((noVariables: Record<string, never>) => QueryKey);
    },
    variables?: Variables,
): Promise<void> {
    const prefetchResult = serverFetcher(query.document, environment.context, variables ?? {});

    if (prefetchResult == null) {
        logger.debug('User not logged in, prefetch aborted');
        return;
    }

    await environment.client.prefetchQuery(query.getKey(variables ?? {}), prefetchResult);
}

export default queryPrefetcher;
