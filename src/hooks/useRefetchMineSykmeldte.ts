import { useApolloClient } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { MineSykmeldteDocument } from "../graphql/queries/graphql.generated";

/**
 * Refetches MineSykmeldte without tying the request to the calling component.
 *
 * Apollo Client 4 aborts an in-flight `refetch()` when the component that owns
 * the query unmounts. A refetch started right before the user navigates away
 * (e.g. after marking søknader as read) would then never reach the cache, and
 * the overview would show stale data.
 */
export function useRefetchMineSykmeldte(): {
  refetchMineSykmeldte: () => Promise<void>;
  refetching: boolean;
} {
  const client = useApolloClient();
  const [refetching, setRefetching] = useState(false);

  const refetchMineSykmeldte = useCallback(async (): Promise<void> => {
    setRefetching(true);
    try {
      await client.query({
        query: MineSykmeldteDocument,
        fetchPolicy: "network-only",
      });
    } finally {
      setRefetching(false);
    }
  }, [client]);

  return { refetchMineSykmeldte, refetching };
}
