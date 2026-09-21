import { requestOboToken } from "@navikt/oasis";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import {
  type FailureStage,
  failureDiagnostics,
  logServerFailure,
} from "../../observability/serverLog";
import { getPaaminnelseConfig, isLocalOrDemo } from "../../utils/env";
import {
  type PaaminnelseFeilkode,
  type PaaminnelseStatus,
  PaaminnelseStatusSchema,
} from "./paaminnelseContract";

const EXTERNAL_FETCH_TIMEOUT_MS = 3000;
const NAV_CONSUMER_ID = "dinesykmeldte";
const SKJULT_STATUS: PaaminnelseStatus = { status: "SKJULT" };
const PAAMINNELSE_PATH_PREFIX = "/api/v1/narmesteleder";

// Lokal/demo-mock (isLocalOrDemo-gated): lokalt og i demo finnes ingen ekte
// oppfolgingsplan-backend, så uten dette ville GET alltid gitt SKJULT og
// modulen aldri vist i demo. Speiler det bevisste mock-mønsteret i
// tiltakspakkevurderingService, slik at hele påminnelsesflyten kan demonstreres
// ende-til-ende. Bestillingstilstanden holdes i minne per prosess — bevisst
// og godt nok for en mock. Byttes ut når demo får en ekte backend.
const localBestilt = new Set<string>();
function getLocalMockStatus(narmestelederId: string): PaaminnelseStatus {
  return {
    status: localBestilt.has(narmestelederId) ? "BESTILT" : "TILGJENGELIG",
  };
}

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
  | {
      ok: false;
      reason: string;
      diagnostics: ReturnType<typeof failureDiagnostics>;
    };

/**
 * Lesing skjuler ved feil: manglende konfigurasjon, token-feil, ikke-2xx-svar
 * eller en body vi ikke kan parse fører alle til SKJULT, så påminnelse-boksen holdes
 * skjult i stedet for å gjette brukerens status. Relasjonen er ressursen, så
 * status er en enkel GET med narmestelederId i pathen.
 */
export async function hentPaaminnelseStatus(
  narmestelederId: string,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  if (isLocalOrDemo) {
    return getLocalMockStatus(narmestelederId);
  }

  const result = await callPaaminnelseBackend("GET", narmestelederId, context);

  if (!result.ok) {
    logServerFailure("paaminnelseReadDegraded", undefined, {
      ...result.diagnostics,
      upstream: "syfo-oppfolgingsplan-backend",
      outcome: "degraded",
    });
    return SKJULT_STATUS;
  }

  return result.status;
}

export async function bestillPaaminnelse(
  narmestelederId: string,
  context: ResolverContextType,
): Promise<PaaminnelseStatus> {
  if (isLocalOrDemo) {
    localBestilt.add(narmestelederId);
    return getLocalMockStatus(narmestelederId);
  }

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
  if (isLocalOrDemo) {
    localBestilt.delete(narmestelederId);
    return getLocalMockStatus(narmestelederId);
  }

  return writePaaminnelse(
    "DELETE",
    narmestelederId,
    context,
    "AVBESTILLING_FEILET",
  );
}

/**
 * Skriving feiler høyt: alt annet enn et gyldig 2xx-svar kaster en
 * PaaminnelseAdapterError med en fast feilkode som API-et kan vise.
 */
async function writePaaminnelse(
  method: "POST" | "DELETE",
  narmestelederId: string,
  context: ResolverContextType,
  feilkode: PaaminnelseWriteFeilkode,
): Promise<PaaminnelseStatus> {
  const result = await callPaaminnelseBackend(method, narmestelederId, context);

  if (!result.ok) {
    logServerFailure("paaminnelseWriteFailed", undefined, {
      ...result.diagnostics,
      upstream: "syfo-oppfolgingsplan-backend",
    });
    throw new PaaminnelseAdapterError(feilkode);
  }

  return result.status;
}

/**
 * Felles TokenX-kall mot syfo-oppfolgingsplan-backend. Backend eier
 * narmesteleder-oppslaget, så vi sender bare den ugjennomsiktige narmestelederId-en i
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
    return {
      ok: false,
      reason: "mangler konfigurasjon",
      diagnostics: {
        failure_kind: "configuration",
        failure_stage: "configuration",
        error_code: "PAAMINNELSE_NOT_CONFIGURED",
      },
    };
  }

  let failureStage: FailureStage = "token_exchange";
  try {
    const oboResult = await requestOboToken(context.accessToken, config.scope);
    if (!oboResult.ok) {
      return {
        ok: false,
        reason: "token-veksling feilet",
        diagnostics: {
          ...failureDiagnostics(oboResult.error, "token_exchange"),
        },
      };
    }

    failureStage = "request";
    const response = await fetchWithTimeout(
      getPaaminnelseUrl(config.url, narmestelederId),
      {
        method,
        headers: getRequestHeaders(context, oboResult.token),
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        reason: "ikke-2xx-svar",
        diagnostics: {
          failure_kind: "http",
          failure_stage: "response",
          error_code: "UPSTREAM_HTTP_ERROR",
          upstream_status: response.status,
        },
      };
    }

    failureStage = "response_parse";
    const status = await parseStatus(response);
    if (status == null) {
      return {
        ok: false,
        reason: "ugyldig svar-body",
        diagnostics: {
          failure_kind: "invalid_response",
          failure_stage: "response_validation",
          error_code: "UPSTREAM_RESPONSE_SCHEMA_MISMATCH",
          upstream_status: response.status,
        },
      };
    }

    return { ok: true, status };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      reason: timedOut ? "timeout" : "kallet feilet",
      diagnostics: {
        ...failureDiagnostics(error, failureStage),
        ...(timedOut
          ? { failure_kind: "timeout", error_code: "UPSTREAM_TIMEOUT" }
          : failureStage === "response_parse"
            ? {
                failure_kind: "invalid_response",
                error_code: "UPSTREAM_RESPONSE_PARSE_ERROR",
              }
            : {}),
      },
    };
  }
}

function getPaaminnelseUrl(baseUrl: string, narmestelederId: string) {
  return new URL(
    `${PAAMINNELSE_PATH_PREFIX}/${encodeURIComponent(narmestelederId)}/oppfolgingsplaner/paaminnelse`,
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
