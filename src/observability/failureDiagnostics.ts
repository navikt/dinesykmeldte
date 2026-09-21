/** Code-owned transport categories. No messages, URLs or client objects leave this boundary. */
export type FailureKind =
  | "dns"
  | "timeout"
  | "connection"
  | "tls"
  | "http"
  | "invalid_response"
  | "unknown";

const transportCodes = {
  ENOTFOUND: ["dns", "UPSTREAM_DNS_FAILURE"],
  EAI_AGAIN: ["dns", "UPSTREAM_DNS_FAILURE"],
  ETIMEDOUT: ["timeout", "UPSTREAM_TIMEOUT"],
  ECONNABORTED: ["timeout", "UPSTREAM_TIMEOUT"],
  UND_ERR_CONNECT_TIMEOUT: ["timeout", "UPSTREAM_TIMEOUT"],
  UND_ERR_HEADERS_TIMEOUT: ["timeout", "UPSTREAM_TIMEOUT"],
  UND_ERR_BODY_TIMEOUT: ["timeout", "UPSTREAM_TIMEOUT"],
  ECONNREFUSED: ["connection", "UPSTREAM_CONNECTION_FAILED"],
  ECONNRESET: ["connection", "UPSTREAM_CONNECTION_FAILED"],
  EPIPE: ["connection", "UPSTREAM_CONNECTION_FAILED"],
  UND_ERR_SOCKET: ["connection", "UPSTREAM_CONNECTION_FAILED"],
  CERT_HAS_EXPIRED: ["tls", "UPSTREAM_TLS_FAILED"],
  DEPTH_ZERO_SELF_SIGNED_CERT: ["tls", "UPSTREAM_TLS_FAILED"],
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: ["tls", "UPSTREAM_TLS_FAILED"],
  ERR_TLS_CERT_ALTNAME_INVALID: ["tls", "UPSTREAM_TLS_FAILED"],
} as const;

const causeTypes = new Set([
  "Error",
  "TypeError",
  "SyntaxError",
  "TimeoutError",
  "AbortError",
  "AggregateError",
]);

export function transportFailureDiagnostics(error: unknown) {
  const seen = new Set<unknown>();
  let cause = error;
  let causeType: string | undefined;
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
    )
      causeType = cause.name;
    if (
      "code" in cause &&
      typeof cause.code === "string" &&
      Object.hasOwn(transportCodes, cause.code)
    ) {
      const [failure_kind, error_code] =
        transportCodes[cause.code as keyof typeof transportCodes];
      return {
        failure_kind,
        error_code,
        ...(causeType ? { cause_type: causeType } : {}),
      };
    }
    if ("name" in cause && cause.name === "TimeoutError") {
      return {
        failure_kind: "timeout" as const,
        error_code: "UPSTREAM_TIMEOUT" as const,
        cause_type: "TimeoutError",
      };
    }
    cause = "cause" in cause ? cause.cause : undefined;
  }
  return {
    failure_kind: "unknown" as const,
    error_code: "UPSTREAM_NETWORK_ERROR" as const,
    ...(causeType ? { cause_type: causeType } : {}),
  };
}
