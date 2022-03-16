import { InMemoryCacheConfig } from '@apollo/client/cache/inmemory/types';
import { onError } from '@apollo/client/link/error';

import { logger } from '../utils/logger';

import possibleTypesGenerated from './queries/possible-types.generated';

export const cacheConfig: Pick<InMemoryCacheConfig, 'possibleTypes' | 'typePolicies'> = {
    possibleTypes: possibleTypesGenerated.possibleTypes,
    typePolicies: {
        PreviewSykmeldt: { keyFields: ['narmestelederId'] },
        Periode: { keyFields: ['fom', 'tom'] },
    },
};

export const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) => {
            logger.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        });

    if (networkError) {
        logger.error(`[Network error]: ${networkError}`);
    }
});
