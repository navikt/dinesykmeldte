import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getPaaminnelseConfig } from "../../utils/env";
import {
  type PaaminnelseFeilkode,
  type PaaminnelseStatus,
  PaaminnelseStatusSchema,
} from "./paaminnelseContract";

const EXTERNAL_FETCH_TIMEOUT_MS = 3000;
const NAV_CONSUMER_ID = "dinesykmeldte";
const SKJULT_STATUS: PaaminnelseStatus = { status: "SKJULT", synligFra: null };
const PAAMINNELSE_PATH_PREFIX = "/api/oppfolgingsplan/paaminnelse";

type PaaminnelseWriteFeilkode = Extract<
  PaaminnelseFeilkode,
  "BESTILLING_FEILET" | "AVBESTILLING_FEILET"
>;

export class PaaminnelseAdapterError extends Error {
  readonly feilkode: PaaminnelseWriteFeilkode;

  constructor(feilkode: PaaminnelseWriteFeilkode) {
    super(feilkode);
    this.name = "PaaminnelseAdapterError";
    this.feilkode = feilkode;
  }
}

type BackendResult =
  | { ok: true; status: PaaminnelseStatus }
  | { ok: false; reason: string };

/**
 * Reading fails closed: a missing config, token error, non-2xx response or
 * unparseable body all resolve to SKJULT so the reminder UI stays hidden
 * rather than guessing the user's status. The narmesteleder relation is the
 * resource, so the status is a plain GET keyed on narmestelederId in the path.
 */
export async function hentPaaminnelseStatus(
  narmestelederId: string,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  const result = await callPaaminnelseBackend("GET", narmestelederId, context);

  if (!result.ok) {
    logger.warn(
      { xRequestId: context.xRequestId ?? "unknown" },
      `Paaminnelse status adapter failed closed (${result.reason})`,
    );
    return SKJULT_STATUS;
  }

  return result.status;
}

export async function bestillPaaminnelse(
  narmestelederId: string,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  return writePaaminnelse(
    "POST",
    narmestelederId,
    context,
    "BESTILLING_FEILET",
  );
}

export async function avbestillPaaminnelse(
  narmestelederId: string,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  return writePaaminnelse(
    "DELETE",
    narmestelederId,
    context,
    "AVBESTILLING_FEILET",
  );
}

/**
 * Writes fail loud: anything other than a valid 2xx response throws a
 * PaaminnelseAdapterError carrying a fixed feilkode for the route to surface.
 */
async function writePaaminnelse(
  method: "POST" | "DELETE",
  narmestelederId: string,
  context: ResolverContextType,
  feilkode: PaaminnelseWriteFeilkode,
): Promise<PaaminnelseStatus> {
  const result = await callPaaminnelseBackend(method, narmestelederId, context);

  if (!result.ok) {
    logger.error(
      { xRequestId: context.xRequestId ?? "unknown", feilkode },
      `Paaminnelse adapter write failed (${result.reason})`,
    );
    throw new PaaminnelseAdapterError(feilkode);
  }

  return result.status;
}

/**
 * Shared TokenX call against syfo-oppfolgingsplan-backend. The backend owns the
 * narmesteleder lookup, so we pass only the opaque narmestelederId in the path
 * and send no body: GET reads status, POST bestiller, DELETE avbestiller. The
 * caller decides what a failure means (SKJULT for reads, a thrown error for
 * writes); the returned reason is always PII-free.
 */
async function callPaaminnelseBackend(
  method: "GET" | "POST" | "DELETE",
  narmestelederId: string,
  context: ResolverContextType,
): Promise<BackendResult> {
  const config = getPaaminnelseConfig();
  if (config == null) {
    return { ok: false, reason: "missing config" };
  }

  try {
    const oboResult = await requestOboToken(context.accessToken, config.scope);
    if (!oboResult.ok) {
      return { ok: false, reason: "token exchange" };
    }

    const response = await fetchWithTimeout(
      getPaaminnelseUrl(config.url, narmestelederId),
      {
        method,
        headers: getRequestHeaders(context, oboResult.token),
      },
    );

    if (!response.ok) {
      return { ok: false, reason: "non-2xx response" };
    }

    const status = await parseStatus(response);
    if (status == null) {
      return { ok: false, reason: "invalid response body" };
    }

    return { ok: true, status };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return { ok: false, reason: timedOut ? "timeout" : "request failure" };
  }
}

function getPaaminnelseUrl(baseUrl: string, narmestelederId: string): string {
  return new URL(
    `${PAAMINNELSE_PATH_PREFIX}/${encodeURIComponent(narmestelederId)}`,
    baseUrl,
  ).toString();
}

function getRequestHeaders(
  context: Pick<ResolverContextType, "xRequestId">,
  token: string,
): HeadersInit {
  return {
    "x-request-id": context.xRequestId ?? "unknown",
    "Nav-Call-Id": context.xRequestId ?? "unknown",
    "Nav-Consumer-Id": NAV_CONSUMER_ID,
    Authorization: `Bearer ${token}`,
  };
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    EXTERNAL_FETCH_TIMEOUT_MS,
  );

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseStatus(
  response: Response,
): Promise<PaaminnelseStatus | null> {
  const parsed = PaaminnelseStatusSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}
