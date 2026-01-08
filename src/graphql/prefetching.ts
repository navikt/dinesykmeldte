import { GetServerSidePropsContext, NextApiRequest } from "next";
import {
  ApolloClient,
  ApolloQueryResult,
  InMemoryCache,
  NormalizedCacheObject,
  from,
} from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { createResolverContextType } from "../auth/withAuthentication";
import { PrefetchResults } from "../shared/types";
import { cacheConfig, errorLink } from "./apollo";
import schema from "./schema";

export function createSsrApolloClient(
  request: GetServerSidePropsContext["req"] | NextApiRequest,
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(cacheConfig),
    link: from([
      errorLink,
      new SchemaLink({
        schema,
        context: () => createResolverContextType(request),
      }),
    ]),
  });
}

/**
 * Will prefetch multiple queries. Prepare queries with client.query(...).
 * Failed prefetches are ignored and logged.
 */
export async function prefetchMutlipleQueries(
  queries: Promise<ApolloQueryResult<unknown>>[],
): Promise<void> {
  await Promise.all(queries);
}

/**
 * Wraps the prefetched QueryClient in the required props shape for a page
 * to be rehydrated with the prefetched ReactQuery state.
 */
export function wrapProps(
  client: ApolloClient<NormalizedCacheObject>,
  version: string,
  isIE: boolean,
): PrefetchResults {
  return {
    apolloCache: client.extract(),
    version,
    isIE,
  };
}
