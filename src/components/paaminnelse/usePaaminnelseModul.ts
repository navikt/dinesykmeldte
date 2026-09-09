"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import { useErITiltaksgruppe } from "../../services/tiltakspakke/useTiltakspakkevurdering";
import {
  executePaaminnelseAction,
  type PaaminnelseAction,
} from "./paaminnelseActions";
import {
  getPaaminnelseAvailability,
  type VisiblePaaminnelseStatus,
} from "./paaminnelseAvailability";
import { usePaaminnelseTelemetry } from "./usePaaminnelseTelemetry";

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
      telemetryRef: RefObject<HTMLElement | null>;
    };

export function usePaaminnelseModul({
  narmestelederId,
  orgnummer,
}: Params): PaaminnelseModulTilstand {
  const queryClient = useQueryClient();
  const vurdering = useErITiltaksgruppe(narmestelederId ? orgnummer : null);

  const paaminnelseKey = ["paaminnelse", narmestelederId] as const;
  const statusQuery = useQuery({
    queryKey: paaminnelseKey,
    queryFn: ({ signal }) => paaminnelseApi.hentStatus(narmestelederId, signal),
    enabled: vurdering.erITiltaksgruppe,
    retry: false,
  });

  const availability = getPaaminnelseAvailability({
    hasContext: Boolean(narmestelederId && orgnummer),
    vurdering,
    statusQuery,
  });
  const telemetryRef = usePaaminnelseTelemetry({
    narmestelederId,
    orgnummer,
    gruppe: vurdering.gruppe,
    availability,
  });

  const mutation = useMutation({
    retry: false,
    mutationFn: executePaaminnelseAction,
    onSuccess: (nyStatus, submitted) => {
      // Navigation may have changed the visible reminder while awaiting this response.
      queryClient.setQueryData(
        ["paaminnelse", submitted.narmestelederId],
        nyStatus,
      );
    },
  });

  if (availability.kind !== "visible") {
    return { show: false };
  }

  const currentAction =
    mutation.variables?.narmestelederId === narmestelederId
      ? mutation.variables.action
      : null;
  const isBestilt = availability.status === "BESTILT";

  return {
    telemetryRef,
    show: true,
    paaminnelseStatus: availability.status,
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
        gruppe: vurdering.gruppe,
      }),
    isBestilt,
  };
}
