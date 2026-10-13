import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { createAppRouterResolverContextType } from "../auth/withAuthenticatedApiRoute";
import type { PrefetchResults } from "../shared/types";
import { cacheConfig, errorLink } from "./apollo";
import schema from "./schema";

export function createSsrApolloClient(request: Request): ApolloClient {
  return new ApolloClient({
    ssrMode: true,
    defaultOptions: {
      watchQuery: { notifyOnNetworkStatusChange: false },
    },
    cache: new InMemoryCache(cacheConfig),
    link: ApolloLink.from([
      errorLink,
      new SchemaLink({
        schema,
        context: () => createAppRouterResolverContextType(request),
      }),
    ]),
  });
}

/**
 * Will prefetch multiple queries. Prepare queries with client.query(...).
 * Failed prefetches are ignored and logged.
 */
export async function prefetchMutlipleQueries(
  queries: Promise<ApolloClient.QueryResult<unknown>>[],
): Promise<void> {
  await Promise.all(queries);
}

/**
 * Wraps the prefetched QueryClient in the required props shape for a page
 * to be rehydrated with the prefetched ReactQuery state.
 */
export function wrapProps(
  client: ApolloClient,
  version: string,
  isIE: boolean,
): PrefetchResults {
  return {
    apolloCache: client.extract() as NormalizedCacheObject,
    version,
    isIE,
  };
}
