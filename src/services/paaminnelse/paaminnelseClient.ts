import { browserEnv } from "../../utils/env";
import {
  type PaaminnelseStatus,
  PaaminnelseStatusSchema,
} from "./paaminnelseContract";

const BASE_PATH = browserEnv.publicPath ?? "";

/**
 * Klientside-adapter mot påminnelse-BFF-en (nettleser → `/api/paaminnelse`).
 * Eksponert som et navngitt objekt for å skille tydelig fra server-servicen i
 * `paaminnelseService.ts`, som har samme verb men tar en OBO-kontekst. Prefikser
 * med basePath og validerer svaret mot delt zod-kontrakt før UI-et bruker det.
 */
export const paaminnelseApi = {
  async hentStatus(
    narmestelederId: string,
    signal: AbortSignal,
  ): Promise<PaaminnelseStatus> {
    const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
      method: "GET",
      signal,
    });

    return PaaminnelseStatusSchema.parse(json);
  },

  async bestill(narmestelederId: string): Promise<PaaminnelseStatus> {
    const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    return PaaminnelseStatusSchema.parse(json);
  },

  async avbestill(narmestelederId: string): Promise<PaaminnelseStatus> {
    const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
      method: "DELETE",
    });

    return PaaminnelseStatusSchema.parse(json);
  },
};

async function fetchJson(input: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error("Påminnelse-kall feilet");
  }

  return await response.json();
}

function getPaaminnelsePath(narmestelederId: string): string {
  return `${BASE_PATH}/api/paaminnelse/${encodeURIComponent(narmestelederId)}`;
}
