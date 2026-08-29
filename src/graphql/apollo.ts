import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client";
import type { InMemoryCacheConfig } from "@apollo/client/cache/inmemory/types";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { logger } from "@navikt/next-logger";
import { markApolloErrorAsHandled } from "../observability/apolloErrorOwnership";
import type { PrefetchResults } from "../shared/types";
import metadataSlice from "../state/metadataSlice";
import { store } from "../state/store";
import { browserEnv } from "../utils/env";
import possibleTypesGenerated from "./queries/possible-types.generated";

export const cacheConfig: Pick<
  InMemoryCacheConfig,
  "possibleTypes" | "typePolicies"
> = {
  possibleTypes: possibleTypesGenerated.possibleTypes,
  typePolicies: {
    PreviewSykmeldt: { keyFields: ["narmestelederId"] },
  },
};

const versionDiffLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const { version, stale } = store.getState().metadata;
    const context = operation.getContext();
    const responseVersion = context.response.headers.get("x-version");

    if (stale) {
      return response;
    }

    if (version == null) {
      store.dispatch(metadataSlice.actions.setVersion(responseVersion));
      return response;
    }

    if (version !== responseVersion) {
      store.dispatch(metadataSlice.actions.setStale());
    }

    return response;
  });
});

export function createClientApolloClient(
  pageProps: Partial<PrefetchResults>,
): ApolloClient<NormalizedCacheObject> {
  const cache = new InMemoryCache(cacheConfig);
  if (pageProps.apolloCache) {
    cache.restore(pageProps.apolloCache);
  }

  const httpLink = new HttpLink({
    uri: `${browserEnv.publicPath ?? ""}/api/graphql`,
    headers: {
      "x-client-version": pageProps.version ?? "unknown",
    },
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    cache,
    link: from([
      errorLink,
      new RetryLink({
        attempts: { max: 3 },
      }),
      versionDiffLink.concat(httpLink),
    ]),
  });
}

export const errorLink = onError(
  ({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors)
      graphQLErrors.forEach((error) => {
        markApolloErrorAsHandled(error);
        const { locations, path, extensions } = error;
        logger.error(
          {
            event: "graphql_request_failed",
            category: "graphql",
            operation: operation.operationName || "anonymous",
            path,
            locations,
            code: extensions?.code,
          },
          "GraphQL request returned an error",
        );
      });

    if (networkError) {
      markApolloErrorAsHandled(networkError);
      const status =
        "statusCode" in networkError ? networkError.statusCode : undefined;

      if (status === 401) {
        store.dispatch(metadataSlice.actions.setLoggedOut());
        return;
      }
      if (status === 403) {
        store.dispatch(metadataSlice.actions.setLoggedOut());
        logger.warn(
          { event: "graphql_request_forbidden", status: 403 },
          "GraphQL request was forbidden",
        );
        return;
      }

      logger.error(
        {
          event: "graphql_network_request_failed",
          category: "graphql",
          operation: operation.operationName || "anonymous",
          status,
        },
        "GraphQL network request failed",
      );
    }
  },
);
