/** Copy only recognised platform codes and error types, never messages or client objects. */
const transportCodes = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "ECONNABORTED",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "EPIPE",
  "UND_ERR_SOCKET",
  "CERT_HAS_EXPIRED",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "ERR_TLS_CERT_ALTNAME_INVALID",
]);

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
} {
  const diagnostics: { error_code?: string; cause_type?: string } = {};
  const seen = new Set<unknown>();
  let cause = error;
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
      diagnostics.cause_type = cause.name;
    if (
      "code" in cause &&
      typeof cause.code === "string" &&
      transportCodes.has(cause.code)
    ) {
      diagnostics.error_code = cause.code;
      return diagnostics;
    }
    cause = "cause" in cause ? cause.cause : undefined;
  }
  return diagnostics;
}
