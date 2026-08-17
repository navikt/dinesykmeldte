import type { NormalizedCacheObject } from "@apollo/client";

export interface PrefetchResults {
  apolloCache?: NormalizedCacheObject;
  version: string;
  isIE: boolean;
}
