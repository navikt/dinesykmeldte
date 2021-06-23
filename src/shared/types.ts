import { GetServerSidePropsResult } from 'next';
import { DehydratedState } from 'react-query/hydration';

interface PrefetchResults {
    dehydratedState: DehydratedState;
}

export type GetServerSidePropsPrefetchResult = GetServerSidePropsResult<PrefetchResults>;
