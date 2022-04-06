import { GetServerSidePropsResult } from 'next';
import { NormalizedCacheObject } from '@apollo/client';

export interface PrefetchResults {
    apolloCache?: NormalizedCacheObject;
    version: string;
}

export type GetServerSidePropsPrefetchResult = GetServerSidePropsResult<PrefetchResults>;
