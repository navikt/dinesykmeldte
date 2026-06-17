import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getPaaminnelseConfig } from "../../utils/env";
import {
  type PaaminnelseFeilkode,
  type PaaminnelseIdentifikatorer,
  type PaaminnelseStatus,
  PaaminnelseStatusSchema,
} from "./paaminnelseContract";

const EXTERNAL_FETCH_TIMEOUT_MS = 3000;
const NAV_CONSUMER_ID = "dinesykmeldte";
const SKJULT_STATUS: PaaminnelseStatus = { status: "SKJULT" };
const PAAMINNELSE_STATUS_PATH = "/api/oppfolgingsplan/paaminnelse/status";
const PAAMINNELSE_RESOURCE_PATH = "/api/oppfolgingsplan/paaminnelse";

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
 * rather than guessing the user's status. Status is fetched with POST because
 * the backend takes the identifiers in the body, not the query string.
 */
export async function hentPaaminnelseStatus(
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  const result = await callPaaminnelseBackend(
    "POST",
    PAAMINNELSE_STATUS_PATH,
    identifikatorer,
    context,
  );

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
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  return writePaaminnelse(
    "POST",
    identifikatorer,
    context,
    "BESTILLING_FEILET",
  );
}

export async function avbestillPaaminnelse(
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  return writePaaminnelse(
    "DELETE",
    identifikatorer,
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
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
  feilkode: PaaminnelseWriteFeilkode,
): Promise<PaaminnelseStatus> {
  const result = await callPaaminnelseBackend(
    method,
    PAAMINNELSE_RESOURCE_PATH,
    identifikatorer,
    context,
  );

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
 * Shared TokenX call against syfo-oppfolgingsplan-backend. Returns the parsed
 * status, or a failure with a PII-free reason; the caller decides what a
 * failure means (SKJULT for reads, a thrown error for writes).
 *
 * `method` is the backend's HTTP verb, not the route's: status reads POST
 * (identifiers go in the body), bestilling POSTs, avbestilling DELETEs.
 */
async function callPaaminnelseBackend(
  method: "POST" | "DELETE",
  path: string,
  identifikatorer: PaaminnelseIdentifikatorer,
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
      new URL(path, config.url).toString(),
      {
        method,
        headers: getJsonHeaders(context, oboResult.token),
        body: JSON.stringify(buildBody(identifikatorer)),
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
  } catch {
    return { ok: false, reason: "request failure" };
  }
}

function buildBody({
  orgnummer,
  fnr,
}: PaaminnelseIdentifikatorer): PaaminnelseIdentifikatorer {
  return fnr == null ? { orgnummer } : { orgnummer, fnr };
}

function getJsonHeaders(
  context: Pick<ResolverContextType, "xRequestId">,
  token: string,
): HeadersInit {
  return {
    "x-request-id": context.xRequestId ?? "unknown",
    "Nav-Call-Id": context.xRequestId ?? "unknown",
    "Nav-Consumer-Id": NAV_CONSUMER_ID,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
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
