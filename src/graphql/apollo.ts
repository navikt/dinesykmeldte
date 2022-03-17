import { InMemoryCacheConfig } from '@apollo/client/cache/inmemory/types';
import { onError } from '@apollo/client/link/error';
import { ApolloClient, from, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';

import { logger } from '../utils/logger';
import { getPublicEnv } from '../utils/env';

import possibleTypesGenerated from './queries/possible-types.generated';

const publicEnv = getPublicEnv();

export const cacheConfig: Pick<InMemoryCacheConfig, 'possibleTypes' | 'typePolicies'> = {
    possibleTypes: possibleTypesGenerated.possibleTypes,
    typePolicies: {
        PreviewSykmeldt: { keyFields: ['narmestelederId'] },
        Periode: { keyFields: ['fom', 'tom'] },
    },
};

export function createClientApolloClient(initialCache?: NormalizedCacheObject): ApolloClient<NormalizedCacheObject> {
    const cache = new InMemoryCache(cacheConfig);
    const httpLink = new HttpLink({
        uri: `${publicEnv.publicPath ?? ''}/api/graphql`,
    });
    if (initialCache) {
        cache.restore(initialCache);
    }

    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        cache,
        link: from([
            errorLink,
            new RetryLink({
                attempts: { max: 3 },
            }),
            httpLink,
        ]),
    });
}

export const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) => {
            logger.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        });

    if (networkError) {
        if ('statusCode' in networkError) {
            if (networkError.statusCode === 401 || networkError.statusCode === 403) {
                // Redirect to allow SSR authentication to redirect to login
                window.location.reload();
                return;
            }
        }

        logger.error(`[Network error]: ${networkError}`);
    }
});
