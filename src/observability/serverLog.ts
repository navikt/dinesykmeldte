import {
  apiRequestRejected,
  createLogger,
  defineEvent,
} from "@navikt/esyfo-logger";
import { logger } from "@navikt/next-logger";
import {
  type TransportFailureKind,
  transportFailureDiagnostics,
} from "./failureDiagnostics";

const log = createLogger(logger);
export type FailureStage =
  | "request"
  | "response"
  | "response_parse"
  | "response_validation"
  | "token_exchange"
  | "authentication"
  | "configuration";
type Diagnostics = {
  error_code?: string;
  cause_code?: string;
  failure_kind?:
    | TransportFailureKind
    | "unknown"
    | "http"
    | "invalid_response"
    | "token"
    | "configuration";
  failure_stage?: FailureStage;
  upstream?:
    | "flaggskipet"
    | "dinesykmeldte-backend"
    | "lumi-api"
    | "syfo-oppfolgingsplan-backend";
  upstream_status?: number;
  cause_type?: string;
  outcome?: "failed" | "degraded" | "rejected";
};
const event = (
  name: string,
  operation: string,
  message: string,
  level: "error" | "warn" = "error",
) => defineEvent<Diagnostics>({ name, operation, message, level });

export const serverEvents = {
  virksomheterFetchFailed: event(
    "virksomheter_fetch_failed",
    "virksomheter_fetch",
    "Kunne ikke hente virksomheter",
  ),
  mineSykmeldteFetchFailed: event(
    "mine_sykmeldte_fetch_failed",
    "mine_sykmeldte_fetch",
    "Kunne ikke hente lederens sykmeldte",
  ),
  sykmeldingFetchFailed: event(
    "sykmelding_fetch_failed",
    "sykmelding_fetch",
    "Kunne ikke hente sykmelding",
  ),
  soknadFetchFailed: event(
    "soknad_fetch_failed",
    "soknad_fetch",
    "Kunne ikke hente sykepengesøknad",
  ),
  readFailed: event(
    "mark_read_failed",
    "mark_read",
    "Kunne ikke markere innhold som lest",
  ),
  unlinkSykmeldtFailed: event(
    "unlink_sykmeldt_failed",
    "unlink_sykmeldt",
    "Kunne ikke avkrefte nærmeste leder",
  ),
  markAllReadFailed: event(
    "mark_all_read_failed",
    "mark_all_read",
    "Kunne ikke markere alt innhold som lest",
  ),

  tiltakspakkeLookupFailed: event(
    "tiltakspakkevurdering_lookup_failed",
    "tiltakspakkevurdering_lookup",
    "Kunne ikke hente tiltakspakkevurdering; returnerer tom liste",
  ),
  jwtExpired: event(
    "idporten_token_expired",
    "validate_idporten_token",
    "Innloggingstoken er utløpt",
    "warn",
  ),
  jwtValidationFailed: event(
    "idporten_token_validation_failed",
    "validate_idporten_token",
    "Kunne ikke validere innloggingstoken",
  ),
  jwtParseFailed: event(
    "idporten_token_parse_failed",
    "parse_idporten_token",
    "Kunne ikke lese innloggingstoken",
  ),
  lumiFeedbackFailed: event(
    "lumi_feedback_submit_failed",
    "submit_lumi_feedback",
    "Kunne ikke sende tilbakemelding til Lumi",
  ),
  hendelserResolveFailed: event(
    "hendelser_resolve_failed",
    "resolve_hendelser",
    "Kunne ikke markere hendelser som behandlet",
  ),
  paaminnelseWriteFailed: event(
    "paaminnelse_write_failed",
    "write_paaminnelse",
    "Kunne ikke endre påminnelse om oppfølgingsplan",
  ),
  paaminnelseReadDegraded: event(
    "paaminnelse_status_degraded",
    "fetch_paaminnelse_status",
    "Påminnelse skjules fordi status ikke kunne hentes",
    "warn",
  ),
  paaminnelseRequestFailed: event(
    "paaminnelse_request_failed",
    "handle_paaminnelse",
    "Kunne ikke behandle påminnelseforespørsel",
  ),
  missingAuthenticatedContext: event(
    "authenticated_context_missing",
    "resolve_authenticated_context",
    "Mangler autentisert kontekst for API-kallet",
    "warn",
  ),
  soknadTagUnknown: event(
    "soknad_question_tag_unknown",
    "parse_soknad",
    "Søknad har en ukjent spørsmålstype; viser støttet reserveverdi",
    "warn",
  ),
} as const;

const rejectedRequests = {
  hendelser: apiRequestRejected<{
    rejection_reason: "INVALID_JSON" | "INVALID_HENDELSE_IDS";
  }>({
    operation: "resolve_hendelser",
    message: "Forespørsel om å behandle hendelser har ugyldig input",
  }),
  paaminnelse: apiRequestRejected<{
    rejection_reason: "MISSING_NARMESTELEDER_ID";
  }>({
    operation: "handle_paaminnelse",
    message: "Påminnelseforespørsel mangler nødvendig parameter",
  }),
};

export function logRequestRejected(
  ...[request, reason]:
    | ["hendelser", "INVALID_JSON" | "INVALID_HENDELSE_IDS"]
    | ["paaminnelse", "MISSING_NARMESTELEDER_ID"]
): void {
  if (request === "hendelser") {
    log.event(rejectedRequests.hendelser, { rejection_reason: reason });
  } else {
    log.event(rejectedRequests.paaminnelse, { rejection_reason: reason });
  }
}

/** Only bounded diagnostics are copied; errors remain in memory, never passed to Pino. */
export function failureDiagnostics(
  error: unknown,
  stage?: FailureStage,
): Diagnostics {
  const base: Diagnostics = {
    ...transportFailureDiagnostics(error),
    ...(stage ? { failure_stage: stage } : {}),
  };
  const stages = [
    "request",
    "response",
    "response_parse",
    "response_validation",
    "token_exchange",
  ] as const;
  if (
    stage === undefined &&
    typeof error === "object" &&
    error !== null &&
    "failure_stage" in error &&
    stages.some((stage) => stage === error.failure_stage)
  ) {
    base.failure_stage = error.failure_stage as FailureStage;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "upstream_status" in error &&
    typeof error.upstream_status === "number" &&
    Number.isInteger(error.upstream_status) &&
    error.upstream_status >= 100 &&
    error.upstream_status <= 599
  ) {
    base.upstream_status = error.upstream_status;
    if (error.upstream_status >= 400) {
      base.failure_kind = "http";
      base.error_code = "UPSTREAM_HTTP_ERROR";
    } else if (base.failure_stage === "response") {
      base.failure_kind = "http";
      base.error_code = "UPSTREAM_UNEXPECTED_STATUS";
    }
  }
  if (
    base.failure_stage === "response_parse" ||
    base.failure_stage === "response_validation"
  ) {
    base.failure_kind = "invalid_response";
    base.error_code =
      base.failure_stage === "response_parse"
        ? "UPSTREAM_RESPONSE_PARSE_ERROR"
        : "UPSTREAM_RESPONSE_SCHEMA_MISMATCH";
  }
  if (base.failure_stage === "token_exchange") {
    base.failure_kind = "token";
    base.error_code ??= "TOKENX_OBO_EXCHANGE_ERROR";
  }
  if (base.failure_stage === "authentication") {
    if (!base.error_code) base.failure_kind = "token";
  }
  return base;
}

export function logServerFailure(
  eventName: keyof typeof serverEvents,
  error?: unknown,
  context: Diagnostics = {},
): void {
  log.event(serverEvents[eventName], {
    ...failureDiagnostics(error, context.failure_stage),
    outcome: "failed",
    ...context,
  });
}
