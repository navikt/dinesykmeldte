import { GetServerSidePropsResult } from 'next'
import { NormalizedCacheObject } from '@apollo/client'
import { IToggle } from '@unleash/nextjs'

export interface PrefetchResults {
    apolloCache?: NormalizedCacheObject
    toggles: IToggle[]
    version: string
    isIE: boolean
}

export type GetServerSidePropsPrefetchResult = GetServerSidePropsResult<PrefetchResults>
