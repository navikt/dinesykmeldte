import type { NormalizedCacheObject } from "@apollo/client";
import type { GetServerSidePropsResult } from "next";

export interface PrefetchResults {
  apolloCache?: NormalizedCacheObject;
  version: string;
  isIE: boolean;
}

export type GetServerSidePropsPrefetchResult =
  GetServerSidePropsResult<PrefetchResults>;
