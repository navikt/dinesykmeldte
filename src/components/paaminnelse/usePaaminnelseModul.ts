"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";
import { useErITiltaksgruppe } from "../../services/tiltakspakke/useTiltakspakkevurdering";

export type PaaminnelseAction = "bestill" | "avbestill";
export type VisiblePaaminnelseStatus = Exclude<
  PaaminnelseStatus["status"],
  "SKJULT"
>;

type Params = {
  readonly narmestelederId: string;
  readonly orgnummer: string;
};

export type PaaminnelseModulTilstand =
  | { show: false }
  | {
      show: true;
      paaminnelseStatus: VisiblePaaminnelseStatus;
      isActionPending: boolean;
      errorOnAction: PaaminnelseAction | null;
      finishedAction: PaaminnelseAction | null;
      executeAction: () => void;
      isBestilt: boolean;
    };

export function usePaaminnelseModul({
  narmestelederId,
  orgnummer,
}: Params): PaaminnelseModulTilstand {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<PaaminnelseAction | null>(
    null,
  );
  const [finishedAction, setFinishedAction] =
    useState<PaaminnelseAction | null>(null);

  // Delt kilde for tiltakspakkevurdering, cache og default-deny-semantikk.
  // Ingen egen query her, slik at påminnelsen og «Kom i gang tidlig»-boksen
  // ikke kan divergere.
  const { erITiltaksgruppe: isTiltaksgruppe } = useErITiltaksgruppe(
    narmestelederId ? orgnummer : null,
  );

  const paaminnelseKey = ["paaminnelse", narmestelederId] as const;
  const {
    data: paaminnelseData,
    isError: paaminnelseIsError,
    isLoading: paaminnelseIsLoading,
  } = useQuery({
    queryKey: paaminnelseKey,
    queryFn: ({ signal }) => paaminnelseApi.hentStatus(narmestelederId, signal),
    enabled: isTiltaksgruppe,
    retry: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (action: PaaminnelseAction) =>
      action === "bestill"
        ? paaminnelseApi.bestill(narmestelederId)
        : paaminnelseApi.avbestill(narmestelederId),
    onMutate: () => {
      setActionError(null);
      setFinishedAction(null);
    },
    onSuccess: (nyStatus, action) => {
      if (nyStatus.status !== "SKJULT") {
        setFinishedAction(action);
      }

      // Oppdatere cachen med det nye resultatet, slik at boksen viser riktig status
      queryClient.setQueryData(paaminnelseKey, nyStatus);
    },
    onError: (_, action) => {
      setActionError(action);
    },
  });

  if (
    !narmestelederId ||
    !orgnummer ||
    !isTiltaksgruppe ||
    paaminnelseIsError ||
    paaminnelseIsLoading ||
    !paaminnelseData ||
    paaminnelseData.status === "SKJULT"
  ) {
    return { show: false };
  }

  return {
    show: true,
    paaminnelseStatus: paaminnelseData.status,
    isActionPending: isPending,
    errorOnAction: actionError,
    finishedAction,
    executeAction: () =>
      mutate(paaminnelseData.status === "BESTILT" ? "avbestill" : "bestill"),
    isBestilt: paaminnelseData.status === "BESTILT",
  };
}
