import { beforeEach, describe, expect, it, vi } from "vitest";
import { withAuthenticatedApiRoute } from "./withAuthenticatedApiRoute";

const lines = vi.hoisted((): string[] => []);
const validate = vi.hoisted(() => vi.fn());
vi.mock("../utils/env", () => ({ isLocalOrDemo: false }));
vi.mock("@navikt/oasis", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@navikt/oasis")>()),
  validateToken: validate,
}));
vi.mock("@navikt/next-logger", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@navikt/next-logger")>();
  return {
    ...actual,
    logger: actual.backendLogger(
      {},
      {
        write(line: string) {
          lines.push(line);
        },
      },
    ),
  };
});

describe("authentication failure diagnostics", () => {
  beforeEach(() => {
    lines.length = 0;
    validate.mockReset();
  });
  it.each([
    [
      "token expired",
      "warn",
      "idporten_token_expired",
      "IDPORTEN_TOKEN_EXPIRED",
    ],
    [
      "unknown",
      "error",
      "idporten_token_validation_failed",
      "IDPORTEN_TOKEN_VALIDATION_ERROR",
    ],
  ])("identifies %s while preserving the authorization boundary", async (errorType, level, eventType, errorCode) => {
    const secret = "private-canary-01017012345";
    validate.mockResolvedValue({
      ok: false,
      errorType,
      error: new Error(secret),
    });
    const handler = vi.fn();
    const response = await withAuthenticatedApiRoute(handler)(
      new Request("https://example.test/api/graphql", {
        headers: { authorization: `Bearer ${secret}` },
      }),
      undefined,
    );
    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject({
      level,
      event_type: eventType,
      error_code: errorCode,
      failure_stage: "authentication",
    });
    expect(lines[0]).not.toContain(secret);
    expect(lines[0]).not.toContain("logging_context_invalid");
  });

  it("preserves the transport diagnosis on a failed JWKS lookup", async () => {
    const secret = "private-canary";
    validate.mockResolvedValue({
      ok: false,
      errorType: "unknown",
      error: new Error(secret, {
        cause: Object.assign(new Error(secret), { code: "ENOTFOUND" }),
      }),
    });
    const handler = vi.fn();
    const response = await withAuthenticatedApiRoute(handler)(
      new Request("https://example.test/api/graphql", {
        headers: { authorization: "Bearer synthetic-test-token" },
      }),
      undefined,
    );
    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject({
      level: "error",
      event_type: "idporten_token_validation_failed",
      error_code: "ENOTFOUND",
      failure_kind: "dns",
      failure_stage: "authentication",
    });
    expect(lines[0]).not.toMatch(/private-canary|logging_context_invalid/);
  });
});
