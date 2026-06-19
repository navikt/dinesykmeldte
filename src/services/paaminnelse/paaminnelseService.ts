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
 * Lesing skjuler ved feil: manglende konfigurasjon, token-feil, ikke-2xx-svar
 * eller en body vi ikke kan parse gir alle SKJULT, så påminnelse-boksen holdes
 * skjult i stedet for å gjette brukerens status. Relasjonen er ressursen, så
 * status er en enkel GET med narmestelederId i pathen.
 */
export async function hentPaaminnelseStatus(
  narmestelederId: string,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  const result = await callPaaminnelseBackend("GET", narmestelederId, context);

  if (!result.ok) {
    logger.warn(
      { xRequestId: context.xRequestId ?? "unknown" },
      `Påminnelse-status skjult etter feil (${result.reason})`,
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
 * Skriving feiler høyt: alt annet enn et gyldig 2xx-svar kaster en
 * PaaminnelseAdapterError med en fast feilkode som route-en kan vise.
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
      `Påminnelse-skriving feilet (${result.reason})`,
    );
    throw new PaaminnelseAdapterError(feilkode);
  }

  return result.status;
}

/**
 * Felles TokenX-kall mot syfo-oppfolgingsplan-backend. Backend eier
 * narmesteleder-oppslaget, så vi sender bare den opake narmestelederId-en i
 * pathen og ingen body: GET leser status, POST bestiller, DELETE avbestiller.
 * Kalleren avgjør hva en feil betyr (SKJULT ved lesing, en kastet feil ved
 * skriving). reason-strengen er alltid uten PII.
 */
async function callPaaminnelseBackend(
  method: "GET" | "POST" | "DELETE",
  narmestelederId: string,
  context: ResolverContextType,
): Promise<BackendResult> {
  const config = getPaaminnelseConfig();
  if (config == null) {
    return { ok: false, reason: "mangler konfigurasjon" };
  }

  try {
    const oboResult = await requestOboToken(context.accessToken, config.scope);
    if (!oboResult.ok) {
      return { ok: false, reason: "token-veksling feilet" };
    }

    const response = await fetchWithTimeout(
      getPaaminnelseUrl(config.url, narmestelederId),
      {
        method,
        headers: getRequestHeaders(context, oboResult.token),
      },
    );

    if (!response.ok) {
      return { ok: false, reason: "ikke-2xx-svar" };
    }

    const status = await parseStatus(response);
    if (status == null) {
      return { ok: false, reason: "ugyldig svar-body" };
    }

    return { ok: true, status };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return { ok: false, reason: timedOut ? "timeout" : "kallet feilet" };
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
