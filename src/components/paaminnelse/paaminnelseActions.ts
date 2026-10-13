import {
  type AidPaaminnelseActionEvent,
  recordAidPaaminnelse,
} from "../../observability/aidTelemetry";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";
import type { Tildelingsgruppe } from "../../services/tiltakspakke/tiltakspakkevurderingContract";

export type PaaminnelseAction = "bestill" | "avbestill";

const actions = {
  bestill: {
    request: paaminnelseApi.bestill,
    expectedStatus: "BESTILT",
    previousChoice: "ikke_bestilt",
  },
  avbestill: {
    request: paaminnelseApi.avbestill,
    expectedStatus: "TILGJENGELIG",
    previousChoice: "bestilt",
  },
} as const;

type ActionInput = {
  action: PaaminnelseAction;
  narmestelederId: string;
  gruppe: Tildelingsgruppe;
};

/** The UI offers bestill when available, and avbestill when already ordered. */
export async function executePaaminnelseAction({
  action,
  narmestelederId,
  gruppe,
}: ActionInput): Promise<PaaminnelseStatus> {
  const { request, expectedStatus, previousChoice } = actions[action];
  // Capture the originating context before awaiting; navigation may change it.
  const event: Omit<AidPaaminnelseActionEvent, "utfall"> = {
    gruppe,
    variant: "aid",
    hendelse: action,
    paaminnelsevalg: previousChoice,
  };
  recordAidPaaminnelse({ ...event, utfall: "forsok" });

  try {
    const response = await request(narmestelederId);
    const utfall =
      response.status === expectedStatus ? "bekreftet" : "ikke_bekreftet";
    recordAidPaaminnelse({ ...event, utfall });
    return response;
  } catch (error) {
    recordAidPaaminnelse({ ...event, utfall: "feilet" });
    throw error;
  }
}
