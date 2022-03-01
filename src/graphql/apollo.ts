import { InMemoryCacheConfig } from '@apollo/client/cache/inmemory/types';

import possibleTypesGenerated from './queries/possible-types.generated';

export const cacheConfig: Pick<InMemoryCacheConfig, 'possibleTypes' | 'typePolicies'> = {
    possibleTypes: possibleTypesGenerated.possibleTypes,
    typePolicies: {
        PreviewSykmeldt: { keyFields: ['narmestelederId'] },
        Periode: { keyFields: ['fom', 'tom'] },
    },
};
