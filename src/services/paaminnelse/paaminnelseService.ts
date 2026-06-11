import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getPaaminnelseConfig } from "../../utils/env";
import {
  type PaaminnelseFeilkode,
  type PaaminnelseStatus,
  PaaminnelseStatusSchema,
} from "./paaminnelseContract";
import {
  type PaaminnelseIdentifikatorer,
  RawPaaminnelseResponseSchema,
} from "./schema/paaminnelse";

const EXTERNAL_FETCH_TIMEOUT_MS = 3000;
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

export async function hentPaaminnelseStatus(
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  const config = getPaaminnelseConfig();
  if (config == null) {
    return SKJULT_STATUS;
  }

  try {
    const oboResult = await requestOboToken(context.accessToken, config.scope);
    if (!oboResult.ok) {
      logReadFailClosed(context, "token exchange");
      return SKJULT_STATUS;
    }

    const response = await fetchWithTimeout(
      getPaaminnelseUrl(config.url, PAAMINNELSE_STATUS_PATH),
      {
        method: "POST",
        headers: getJsonHeaders(context, oboResult.token),
        body: JSON.stringify(buildBody(identifikatorer)),
      },
    );

    if (!response.ok) {
      logReadFailClosed(context, "non-2xx response");
      return SKJULT_STATUS;
    }

    return (
      (await parsePaaminnelseStatus(response)) ?? failClosedStatus(context)
    );
  } catch {
    logReadFailClosed(context, "request failure");
    return SKJULT_STATUS;
  }
}

export async function bestillPaaminnelse(
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  return executeWriteRequest({
    identifikatorer,
    context,
    method: "POST",
    path: PAAMINNELSE_RESOURCE_PATH,
    feilkode: "BESTILLING_FEILET",
  });
}

export async function avbestillPaaminnelse(
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  return executeWriteRequest({
    identifikatorer,
    context,
    method: "DELETE",
    path: PAAMINNELSE_RESOURCE_PATH,
    feilkode: "AVBESTILLING_FEILET",
  });
}

async function executeWriteRequest({
  identifikatorer,
  context,
  method,
  path,
  feilkode,
}: {
  identifikatorer: PaaminnelseIdentifikatorer;
  context: ResolverContextType;
  method: "POST" | "DELETE";
  path: string;
  feilkode: PaaminnelseWriteFeilkode;
}): Promise<PaaminnelseStatus> {
  const config = getPaaminnelseConfig();
  if (config == null) {
    logWriteFailure(context, feilkode, "missing config");
    throw new PaaminnelseAdapterError(feilkode);
  }

  try {
    const oboResult = await requestOboToken(context.accessToken, config.scope);
    if (!oboResult.ok) {
      logWriteFailure(context, feilkode, "token exchange");
      throw new PaaminnelseAdapterError(feilkode);
    }

    const response = await fetchWithTimeout(
      getPaaminnelseUrl(config.url, path),
      {
        method,
        headers: getJsonHeaders(context, oboResult.token),
        body: JSON.stringify(buildBody(identifikatorer)),
      },
    );

    if (!response.ok) {
      logWriteFailure(context, feilkode, "non-2xx response");
      throw new PaaminnelseAdapterError(feilkode);
    }

    const status = await parsePaaminnelseStatus(response);
    if (status == null) {
      logWriteFailure(context, feilkode, "invalid response body");
      throw new PaaminnelseAdapterError(feilkode);
    }

    return status;
  } catch (error) {
    if (error instanceof PaaminnelseAdapterError) {
      throw error;
    }

    logWriteFailure(context, feilkode, "request failure");
    throw new PaaminnelseAdapterError(feilkode);
  }
}

function buildBody({
  orgnummer,
  fnr,
}: PaaminnelseIdentifikatorer): PaaminnelseIdentifikatorer {
  if (fnr == null) {
    return { orgnummer };
  }

  return { orgnummer, fnr };
}

function getJsonHeaders(
  context: Pick<ResolverContextType, "xRequestId">,
  token: string,
): HeadersInit {
  return {
    "x-request-id": context.xRequestId ?? "unknown",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getPaaminnelseUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).toString();
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
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parsePaaminnelseStatus(
  response: Response,
): Promise<PaaminnelseStatus | null> {
  const rawResponse = RawPaaminnelseResponseSchema.safeParse(
    await response.json(),
  );
  if (!rawResponse.success) {
    return null;
  }

  const mappedStatus = PaaminnelseStatusSchema.safeParse(rawResponse.data);
  if (!mappedStatus.success) {
    return null;
  }

  return mappedStatus.data;
}

function failClosedStatus(
  context: Pick<ResolverContextType, "xRequestId">,
): PaaminnelseStatus {
  logReadFailClosed(context, "invalid response body");
  return SKJULT_STATUS;
}

function logReadFailClosed(
  context: Pick<ResolverContextType, "xRequestId">,
  reason: string,
): void {
  logger.warn(
    { xRequestId: context.xRequestId ?? "unknown" },
    `Paaminnelse status adapter failed closed (${reason})`,
  );
}

function logWriteFailure(
  context: Pick<ResolverContextType, "xRequestId">,
  feilkode: PaaminnelseWriteFeilkode,
  reason: string,
): void {
  logger.error(
    { xRequestId: context.xRequestId ?? "unknown", feilkode },
    `Paaminnelse adapter write failed (${reason})`,
  );
}
