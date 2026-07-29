"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";
import { hentTiltakspakkevurderinger } from "../../services/tiltakspakke/tiltakspakkevurderingClient";
import { isTiltaksgruppeForOrgnummer } from "./paaminnelseUtils";

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

  const tiltakspakkeQueryKey = ["tiltakspakkevurderinger"] as const;
  const {
    data: tiltakspakkeData,
    isError: tiltakspakkeIsError,
    isLoading: tiltakspakkeIsLoading,
  } = useQuery({
    queryKey: tiltakspakkeQueryKey,
    queryFn: ({ signal }) => hentTiltakspakkevurderinger(signal),
    enabled: !!narmestelederId && !!orgnummer,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    retry: false,
  });

  const isTiltaksgruppe = useMemo(
    () =>
      tiltakspakkeData != null &&
      isTiltaksgruppeForOrgnummer(tiltakspakkeData, orgnummer),
    [orgnummer, tiltakspakkeData],
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
    tiltakspakkeIsError ||
    tiltakspakkeIsLoading ||
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
