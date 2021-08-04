import { graphql } from 'graphql';
import { QueryClient, QueryKey } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { ExecutionResult } from 'graphql/execution/execute';

import { PrefetchResults } from '../shared/types';
import { pullTokenSetFromRequest, ServerSideContext } from '../auth/withSession';
import { logger } from '../utils/logger';

import { schema } from './schema';

function serverFetcher(
    document: string,
    context: ServerSideContext,
    variables?: Record<string, unknown>,
): () => Promise<ExecutionResult['data']> {
    return async () => {
        const tokenSet = pullTokenSetFromRequest(context.req);

        // User is not logged in
        if (!tokenSet) {
            throw new Error('Illegal state: User not logged in during prefetch.');
        }

        const result = await graphql(schema, document, undefined, { tokenSet }, variables);

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
    context: ServerSideContext;
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
