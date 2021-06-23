import { graphql } from 'graphql';
import { QueryClient, QueryKey } from 'react-query';

import { schema } from './schema';

function serverFetcher(document: string, variables?: Record<string, unknown>): () => Promise<unknown> {
    return async () => {
        // TODO probably need a more sophisticated way of executing the schema
        const result = await graphql(schema, document, undefined, undefined, variables);

        return result.data;
    };
}

async function queryPrefetcher<Variables>(
    client: QueryClient,
    query: { document: string; getKey: (variables: Variables) => QueryKey },
    variables: Variables,
): Promise<void>;
async function queryPrefetcher(
    client: QueryClient,
    query: { document: string; getKey: (noVariables: Record<string, never>) => QueryKey },
): Promise<void>;
async function queryPrefetcher<Variables>(
    client: QueryClient,
    query: {
        document: string;
        getKey: ((variables?: Variables) => QueryKey) & ((noVariables: Record<string, never>) => QueryKey);
    },
    variables?: Variables,
): Promise<void> {
    await client.prefetchQuery(query.getKey(variables ?? {}), serverFetcher(query.document, variables ?? {}));
}

export default queryPrefetcher;
