import { GetServerSidePropsResult } from 'next';
import { NormalizedCacheObject } from '@apollo/client';

export interface PrefetchResults {
    apolloCache?: NormalizedCacheObject;
}

export type GetServerSidePropsPrefetchResult = GetServerSidePropsResult<PrefetchResults>;
