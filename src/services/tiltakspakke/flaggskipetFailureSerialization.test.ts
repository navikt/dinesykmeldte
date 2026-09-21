import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTiltakspakkevurderinger } from "./tiltakspakkevurderingService";

const lines = vi.hoisted((): string[] => []);
const mocks = vi.hoisted(() => ({ token: vi.fn() }));
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
vi.mock("@navikt/oasis", () => ({ requestOboToken: mocks.token }));
vi.mock("../../utils/env", () => ({
  isLocalOrDemo: false,
  isTiltakspakkevurderingFeatureToggleEnabled: () => true,
  getServerEnv: () => ({
    FLAGGSKIPET_SCOPE: "scope",
    FLAGGSKIPET_URL: "https://flaggskipet.invalid",
  }),
}));
vi.mock("../minesykmeldte/mineSykmeldteService", () => ({
  getMineSykmeldte: async () => [{ orgnummer: "999888777" }],
}));
vi.mock("../../graphql/resolvers/mockresolvers/mockDb", () => ({
  default: () => ({ sykmeldte: [] }),
}));
const secret = "private-canary-01017012345";
const context = { pid: secret, accessToken: secret, xRequestId: secret };

describe("diagnostics from the real Flaggskipet adapter", () => {
  beforeEach(() => {
    lines.length = 0;
    mocks.token.mockReset().mockResolvedValue({ ok: true, token: secret });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["ENOTFOUND", "dns", "UPSTREAM_DNS_FAILURE"],
    ["ETIMEDOUT", "timeout", "UPSTREAM_TIMEOUT"],
    ["ECONNREFUSED", "connection", "UPSTREAM_CONNECTION_FAILED"],
    ["CERT_HAS_EXPIRED", "tls", "UPSTREAM_TLS_FAILED"],
  ])("logs %s once while retaining the empty-list fallback", async (code, kind, errorCode) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        new TypeError(secret, {
          cause: Object.assign(new Error(secret), { code }),
        }),
      ),
    );
    await expect(getTiltakspakkevurderinger(context)).resolves.toEqual([]);
    expectLog({
      failure_kind: kind,
      error_code: errorCode,
      failure_stage: "request",
    });
  });

  it.each([
    [503, secret, "http", "UPSTREAM_HTTP_ERROR", "response"],
    [
      200,
      secret,
      "invalid_response",
      "UPSTREAM_RESPONSE_PARSE_ERROR",
      "response_parse",
    ],
    [
      200,
      JSON.stringify({ secret }),
      "invalid_response",
      "UPSTREAM_RESPONSE_SCHEMA_MISMATCH",
      "response_validation",
    ],
  ])("distinguishes HTTP/JSON/schema failures %s %s", async (status, body, kind, errorCode, stage) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status })),
    );
    await expect(getTiltakspakkevurderinger(context)).resolves.toEqual([]);
    expectLog({
      failure_kind: kind,
      error_code: errorCode,
      failure_stage: stage,
      upstream_status: status,
    });
  });

  it("locates token exchange failure without logging tokens or provider text", async () => {
    mocks.token.mockResolvedValue({ ok: false, error: new Error(secret) });
    vi.stubGlobal("fetch", vi.fn());
    await expect(getTiltakspakkevurderinger(context)).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
    expectLog({
      failure_kind: "token",
      failure_stage: "token_exchange",
      error_code: "TOKENX_OBO_EXCHANGE_ERROR",
    });
  });
});

function expectLog(fields: Record<string, unknown>) {
  expect(lines).toHaveLength(1);
  expect(JSON.parse(lines[0])).toMatchObject({
    level: "error",
    event_type: "tiltakspakkevurdering_lookup_failed",
    upstream: "flaggskipet",
    outcome: "degraded",
    ...fields,
  });
  expect(lines[0]).not.toMatch(
    /private-canary|01017012345|999888777|Authorization/,
  );
  expect(JSON.parse(lines[0])).not.toHaveProperty("err");
}
