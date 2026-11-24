import {
  type AidPaaminnelseEvent,
  recordAidPaaminnelse,
} from "../../observability/aidTelemetry";
import { paaminnelseApi } from "../../services/paaminnelse/paaminnelseClient";
import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";

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
};

/** The UI offers bestill when available, and avbestill when already ordered. */
export async function executePaaminnelseAction({
  action,
  narmestelederId,
}: ActionInput): Promise<PaaminnelseStatus> {
  const { request, expectedStatus, previousChoice } = actions[action];
  // Capture the originating context before awaiting; navigation may change it.
  const event: Omit<AidPaaminnelseEvent, "utfall"> = {
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
