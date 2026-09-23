/** Copy only recognised platform codes and error types, never messages or client objects. */
const transportKinds = {
  ENOTFOUND: "dns",
  EAI_AGAIN: "dns",
  ETIMEDOUT: "timeout",
  ECONNABORTED: "timeout",
  UND_ERR_CONNECT_TIMEOUT: "timeout",
  UND_ERR_HEADERS_TIMEOUT: "timeout",
  UND_ERR_BODY_TIMEOUT: "timeout",
  CERT_HAS_EXPIRED: "tls",
  DEPTH_ZERO_SELF_SIGNED_CERT: "tls",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "tls",
  ERR_TLS_CERT_ALTNAME_INVALID: "tls",
  ECONNREFUSED: "connection",
  ECONNRESET: "connection",
  EPIPE: "connection",
  UND_ERR_SOCKET: "connection",
} as const;

export type TransportFailureKind =
  (typeof transportKinds)[keyof typeof transportKinds];

const causeTypes = new Set([
  "Error",
  "TypeError",
  "SyntaxError",
  "TimeoutError",
  "AbortError",
  "AggregateError",
]);

export function transportFailureDiagnostics(error: unknown): {
  error_code?: string;
  cause_type?: string;
  failure_kind?: TransportFailureKind | "unknown";
} {
  const diagnostics: {
    error_code?: string;
    cause_type?: string;
    failure_kind?: TransportFailureKind | "unknown";
  } = {};
  const seen = new Set<unknown>();
  let cause = error;
  let hasTimeoutError = false;
  for (
    let depth = 0;
    depth < 8 &&
    typeof cause === "object" &&
    cause !== null &&
    !seen.has(cause);
    depth++
  ) {
    seen.add(cause);
    if (
      "name" in cause &&
      typeof cause.name === "string" &&
      causeTypes.has(cause.name)
    ) {
      diagnostics.cause_type = cause.name;
      if (cause.name === "TimeoutError") hasTimeoutError = true;
    }
    if (
      "code" in cause &&
      typeof cause.code === "string" &&
      Object.hasOwn(transportKinds, cause.code)
    ) {
      diagnostics.error_code = cause.code;
      diagnostics.failure_kind =
        transportKinds[cause.code as keyof typeof transportKinds];
      return diagnostics;
    }
    cause = "cause" in cause ? cause.cause : undefined;
  }
  if (typeof error === "object" && error !== null) {
    diagnostics.failure_kind = hasTimeoutError ? "timeout" : "unknown";
    if (hasTimeoutError) diagnostics.cause_type = "TimeoutError";
  }
  return diagnostics;
}
