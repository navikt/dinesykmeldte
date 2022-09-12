import { InMemoryCacheConfig } from '@apollo/client/cache/inmemory/types';
import { onError } from '@apollo/client/link/error';
import { ApolloClient, ApolloLink, from, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { logger } from '@navikt/next-logger';

import { getPublicEnv } from '../utils/env';
import { store } from '../state/store';
import metadataSlice from '../state/metadataSlice';
import { PrefetchResults } from '../shared/types';

import possibleTypesGenerated from './queries/possible-types.generated';

const publicEnv = getPublicEnv();

export const cacheConfig: Pick<InMemoryCacheConfig, 'possibleTypes' | 'typePolicies'> = {
    possibleTypes: possibleTypesGenerated.possibleTypes,
    typePolicies: {
        PreviewSykmeldt: { keyFields: ['narmestelederId'] },
    },
};

const versionDiffLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
        const { version, stale } = store.getState().metadata;
        const context = operation.getContext();
        const responseVersion = context.response.headers.get('x-version');

        if (stale) {
            return response;
        }

        if (version == null) {
            store.dispatch(metadataSlice.actions.setVersion(responseVersion));
            return response;
        }

        if (version !== responseVersion) {
            store.dispatch(metadataSlice.actions.setStale());
        }

        return response;
    });
});

export function createClientApolloClient(pageProps: Partial<PrefetchResults>): ApolloClient<NormalizedCacheObject> {
    const cache = new InMemoryCache(cacheConfig);
    if (pageProps.apolloCache) {
        cache.restore(pageProps.apolloCache);
    }

    const httpLink = new HttpLink({
        uri: `${publicEnv.publicPath ?? ''}/api/graphql`,
        headers: {
            'x-client-version': pageProps.version ?? 'unknown',
        },
    });

    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        cache,
        link: from([
            errorLink,
            new RetryLink({
                attempts: { max: 3 },
            }),
            versionDiffLink.concat(httpLink),
        ]),
    });
}

export const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) => {
            logger.error(`[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`);
        });

    if (networkError) {
        if ('statusCode' in networkError) {
            if (networkError.statusCode === 401 || networkError.statusCode === 403) {
                store.dispatch(metadataSlice.actions.setLoggedOut());
                return;
            }
        }

        logger.error(`[Network error]: ${networkError}`);
    }
});
