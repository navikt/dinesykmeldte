import { ApolloServer } from "@apollo/server";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import schema from "../schema";
import type { ResolverContextType } from "./resolverTypes";

const mocks = vi.hoisted(() => ({ lines: [] as string[], token: vi.fn() }));
vi.mock("@navikt/next-logger", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@navikt/next-logger")>();
  return {
    ...actual,
    logger: actual.backendLogger(
      {},
      { write: (line: string) => mocks.lines.push(line) },
    ),
  };
});
vi.mock("@navikt/oasis", () => ({ requestOboToken: mocks.token }));
vi.mock("../../utils/env", () => ({
  isLocalOrDemo: false,
  getServerEnv: () => ({
    DINE_SYKMELDTE_BACKEND_SCOPE: "test-scope",
    DINE_SYKMELDTE_BACKEND_URL: "https://backend.invalid",
  }),
}));

const secret = "private-canary-01017012345";
const server = new ApolloServer<ResolverContextType>({
  schema,
  includeStacktraceInErrorResponses: false,
});
const run = (
  query = "query { private_alias: mineSykmeldte { narmestelederId } }",
) =>
  server.executeOperation(
    { query },
    {
      contextValue: { pid: secret, accessToken: secret, xRequestId: secret },
    },
  );
const expectFailure = (
  result: Awaited<ReturnType<typeof run>>,
  fields: Record<string, unknown>,
) => {
  expect(result.body.kind).toBe("single");
  if (result.body.kind !== "single")
    throw new Error("Expected single response");
  expect(result.body.singleResult.errors).toHaveLength(1);
  expect(result.body.singleResult.errors?.[0]).toMatchObject({
    message: "Backend request failed",
    extensions: { code: "INTERNAL_SERVER_ERROR", serverLogged: true },
  });
  const errors = mocks.lines
    .map((line) => JSON.parse(line))
    .filter((line) => line.level === "error");
  expect(errors).toHaveLength(1);
  expect(errors[0]).toMatchObject({
    upstream: "dinesykmeldte-backend",
    ...fields,
  });
  expect(JSON.stringify(result.body)).not.toContain(secret);
  expect(mocks.lines.join()).not.toMatch(
    /private_alias|private-canary|01017012345/,
  );
};

describe("real Apollo resolver failure serialization", () => {
  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeEach(() => {
    mocks.lines.length = 0;
    mocks.token.mockReset().mockResolvedValue({ ok: true, token: secret });
  });
  afterEach(() => vi.unstubAllGlobals());
  it.each([
    ["ENOTFOUND", "dns"],
    ["ETIMEDOUT", "timeout"],
    ["ECONNREFUSED", "connection"],
    ["CERT_HAS_EXPIRED", "tls"],
  ])("diagnoses %s before Apollo removes the cause", async (code, kind) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        new TypeError(secret, {
          cause: Object.assign(new Error(secret), { code }),
        }),
      ),
    );
    expectFailure(await run(), {
      event_type: "mine_sykmeldte_fetch_failed",
      operation: "mine_sykmeldte_fetch",
      failure_kind: kind,
    });
  });
  it.each([
    [503, "{}", "http", "UPSTREAM_HTTP_ERROR"],
    [200, secret, "invalid_response", "UPSTREAM_RESPONSE_PARSE_ERROR"],
    [200, "{}", "invalid_response", "UPSTREAM_RESPONSE_SCHEMA_MISMATCH"],
  ])("retains %s failure evidence", async (status, body, kind, code) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status })),
    );
    expectFailure(await run(), {
      event_type: "mine_sykmeldte_fetch_failed",
      failure_kind: kind,
      error_code: code,
      upstream_status: status,
    });
  });
  it("logs a failed token grant once and keeps provider details from the GraphQL response", async () => {
    mocks.token.mockResolvedValue({ ok: false, error: new Error(secret) });
    expectFailure(await run(), {
      failure_kind: "token",
      failure_stage: "token_exchange",
      error_code: "TOKENX_OBO_EXCHANGE_ERROR",
    });
  });
  it("uses a separate code-owned mutation operation without logging its ID", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(secret, { status: 503 })),
    );
    expectFailure(
      await run(
        'mutation { read(type: Soknad, id: "c8673d2a-a550-42b2-a22d-123456789012") }',
      ),
      {
        event_type: "mark_read_failed",
        operation: "mark_read",
        upstream_status: 503,
      },
    );
  });
  it("returns valid data without a failure event", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json([])));
    const result = await run();
    if (result.body.kind !== "single")
      throw new Error("Expected single response");
    expect(result.body.singleResult.errors).toBeUndefined();
    expect(
      mocks.lines
        .map((line) => JSON.parse(line))
        .filter((line) => line.level === "error"),
    ).toHaveLength(0);
  });
});
