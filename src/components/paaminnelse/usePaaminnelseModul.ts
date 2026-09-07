"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  type AidPaaminnelseEvent,
  recordAidPaaminnelse,
} from "../../observability/aidTelemetry";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";
import { useErITiltaksgruppe } from "../../services/tiltakspakke/useTiltakspakkevurdering";
import { usePaaminnelseTelemetry } from "./usePaaminnelseTelemetry";

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
      telemetryRef: React.RefObject<HTMLElement | null>;
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
  const {
    erITiltaksgruppe: isTiltaksgruppe,
    erVurderingFerdig,
    gruppe,
  } = useErITiltaksgruppe(narmestelederId ? orgnummer : null);

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

  const show =
    !!narmestelederId &&
    !!orgnummer &&
    isTiltaksgruppe &&
    !paaminnelseIsError &&
    !paaminnelseIsLoading &&
    paaminnelseData != null &&
    paaminnelseData.status !== "SKJULT";
  const paaminnelsevalg: AidPaaminnelseEvent["paaminnelsevalg"] = show
    ? paaminnelseData?.status === "BESTILT"
      ? "bestilt"
      : "ikke_bestilt"
    : gruppe === "kontroll" || gruppe === "utenfor_scope"
      ? "ikke_tilbudt"
      : "ukjent";
  const telemetryRef = usePaaminnelseTelemetry(
    JSON.stringify([narmestelederId, orgnummer]),
    narmestelederId &&
      orgnummer &&
      erVurderingFerdig &&
      (!isTiltaksgruppe || !paaminnelseIsLoading)
      ? {
          gruppe,
          variant: show ? "aid" : "skjult",
          paaminnelsevalg,
          utfall: show
            ? "tilgjengelig"
            : gruppe === "ukjent"
              ? "vurdering_mangler"
              : paaminnelseIsError
                ? "status_feilet"
                : "skjult",
        }
      : null,
  );

  const { mutate, isPending } = useMutation({
    retry: false,
    mutationFn: async (action: PaaminnelseAction) => {
      const event = {
        gruppe,
        variant: "aid" as const,
        paaminnelsevalg,
        hendelse: action,
      };
      recordAidPaaminnelse({ ...event, utfall: "forsok" });
      try {
        const response = await (action === "bestill"
          ? paaminnelseApi.bestill(narmestelederId)
          : paaminnelseApi.avbestill(narmestelederId));
        const expectedStatus =
          action === "bestill" ? "BESTILT" : "TILGJENGELIG";
        recordAidPaaminnelse({
          ...event,
          utfall:
            response.status === expectedStatus ? "bekreftet" : "ikke_bekreftet",
        });
        return response;
      } catch (error) {
        recordAidPaaminnelse({ ...event, utfall: "feilet" });
        throw error;
      }
    },
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

  if (!show || !paaminnelseData || paaminnelseData.status === "SKJULT") {
    return { show: false };
  }

  return {
    telemetryRef,
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
