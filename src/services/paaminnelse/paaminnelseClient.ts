import { browserEnv } from "../../utils/env";
import {
  type PaaminnelseStatus,
  PaaminnelseStatusSchema,
} from "./paaminnelseContract";

const BASE_PATH = browserEnv.publicPath ?? "";

/**
 * Klientside-adapter mot påminnelse-BFF-en. Speiler server-servicens API
 * (hent/bestill/avbestill), men kjører i nettleseren: prefikser med basePath og
 * validerer svaret mot delt zod-kontrakt før det slippes videre til UI-et.
 */
export async function hentPaaminnelseStatus(
  narmestelederId: string,
  signal: AbortSignal,
): Promise<PaaminnelseStatus> {
  const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
    method: "GET",
    signal,
  });

  return PaaminnelseStatusSchema.parse(json);
}

export async function bestillPaaminnelse(
  narmestelederId: string,
): Promise<PaaminnelseStatus> {
  const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  return PaaminnelseStatusSchema.parse(json);
}

export async function avbestillPaaminnelse(
  narmestelederId: string,
): Promise<PaaminnelseStatus> {
  const json = await fetchJson(getPaaminnelsePath(narmestelederId), {
    method: "DELETE",
  });

  return PaaminnelseStatusSchema.parse(json);
}

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
