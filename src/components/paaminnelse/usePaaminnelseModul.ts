"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";

type PaaminnelseAction = "bestill" | "avbestill";

type Params = {
  readonly narmestelederId: string;
};

export type PaaminnelseModulTilstand =
  | { show: false }
  | {
      show: true;
      paaminnelseStatus: Exclude<PaaminnelseStatus["status"], "SKJULT">;
      isActionPending: boolean;
      errorOnAction: PaaminnelseAction | null;
      finishedAction: PaaminnelseAction | null;
      executeAction: () => void;
      isBestilt: boolean;
    };

export function usePaaminnelseModul({
  narmestelederId,
}: Params): PaaminnelseModulTilstand {
  const queryClient = useQueryClient();

  const paaminnelseKey = ["paaminnelse", narmestelederId] as const;
  const statusQuery = useQuery({
    queryKey: paaminnelseKey,
    queryFn: ({ signal }) => paaminnelseApi.hentStatus(narmestelederId, signal),
    enabled: Boolean(narmestelederId),
    retry: false,
  });

  const mutation = useMutation({
    retry: false,
    mutationFn: ({
      action,
      narmestelederId,
    }: {
      action: PaaminnelseAction;
      narmestelederId: string;
    }) => paaminnelseApi[action](narmestelederId),
    onSuccess: (nyStatus, submitted) => {
      // Navigation may have changed the visible reminder while awaiting this response.
      queryClient.setQueryData(
        ["paaminnelse", submitted.narmestelederId],
        nyStatus,
      );
    },
  });

  const status = statusQuery.data?.status;
  if (statusQuery.isError || !status || status === "SKJULT") {
    return { show: false };
  }

  const currentAction =
    mutation.variables?.narmestelederId === narmestelederId
      ? mutation.variables.action
      : null;
  const isBestilt = status === "BESTILT";

  return {
    show: true,
    paaminnelseStatus: status,
    // Keep one operation at a time, including across navigation.
    isActionPending: mutation.isPending,
    errorOnAction: mutation.isError ? currentAction : null,
    finishedAction:
      mutation.isSuccess && mutation.data.status !== "SKJULT"
        ? currentAction
        : null,
    executeAction: () =>
      mutation.mutate({
        action: isBestilt ? "avbestill" : "bestill",
        narmestelederId,
      }),
    isBestilt,
  };
}
