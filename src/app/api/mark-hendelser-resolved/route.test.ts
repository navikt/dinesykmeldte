import { GraphQLError } from "graphql";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  lines: [] as string[],
  token: vi.fn(),
  mode: "real" as "real" | "resultErrors" | "unlogged",
}));
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
vi.mock("../../../auth/withAuthenticatedApiRoute", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../auth/withAuthenticatedApiRoute")
    >();
  return {
    ...actual,
    withAuthenticatedApiRoute: (handler: typeof POST) => handler,
    createAppRouterResolverContextType: () => ({
      pid: "private-canary",
      accessToken: "private-canary",
      xRequestId: "private-canary",
    }),
  };
});
vi.mock("../../../utils/env", () => ({
  isLocalOrDemo: false,
  getServerEnv: () => ({
    DINE_SYKMELDTE_BACKEND_SCOPE: "test-scope",
    DINE_SYKMELDTE_BACKEND_URL: "https://backend.invalid",
  }),
}));
vi.mock("../../../graphql/prefetching", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../graphql/prefetching")>();
  return {
    ...actual,
    createSsrApolloClient: (request: Request) => {
      if (mocks.mode === "real") return actual.createSsrApolloClient(request);
      return {
        mutate: () =>
          mocks.mode === "resultErrors"
            ? Promise.resolve({
                errors: [
                  new GraphQLError("Backend request failed", {
                    extensions: { serverLogged: true },
                  }),
                ],
              })
            : Promise.reject(new Error("private-canary")),
      };
    },
  };
});

const secret = "private-canary";
const request = (body: string) =>
  new Request("https://example.test/api/mark-hendelser-resolved", {
    method: "POST",
    body,
  });
const failureEvents = () =>
  mocks.lines
    .map((line) => JSON.parse(line) as Record<string, unknown>)
    .filter((line) => line.level === "error");

describe("hendelser logging boundary", () => {
  beforeEach(() => {
    mocks.lines.length = 0;
    mocks.mode = "real";
    mocks.token.mockReset().mockResolvedValue({ ok: true, token: secret });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("logs a failed read once at the resolver, not again at the route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(secret, { status: 503 })),
    );

    const response = await POST(
      request(JSON.stringify({ hendelseIds: [secret] })),
      undefined,
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to mark hendelser as resolved",
    });
    expect(failureEvents()).toHaveLength(1);
    expect(failureEvents()[0]).toMatchObject({
      event_type: "mark_read_failed",
      upstream_status: 503,
    });
    expect(mocks.lines.join()).not.toContain("logging_context_invalid");
    expect(mocks.lines.join()).not.toContain(secret);
  });

  it("logs once for each failed backend call in a batch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })),
    );
    const response = await POST(
      request('{"hendelseIds":["first","second"]}'),
      undefined,
    );
    expect(response.status).toBe(500);
    expect(failureEvents()).toHaveLength(2);
    expect(failureEvents().map((line) => line.event_type)).toEqual([
      "mark_read_failed",
      "mark_read_failed",
    ]);
    expect(mocks.lines.join()).not.toMatch(
      /logging_context_invalid|private-canary/,
    );
  });

  it("does not repeat a logged GraphQLError returned in result.errors", async () => {
    mocks.mode = "resultErrors";
    const response = await POST(request('{"hendelseIds":["id"]}'), undefined);
    expect(response.status).toBe(500);
    expect(failureEvents()).toHaveLength(0);
  });

  it("logs an unmarked failure once at the route", async () => {
    mocks.mode = "unlogged";
    const response = await POST(request('{"hendelseIds":["id"]}'), undefined);
    expect(response.status).toBe(500);
    expect(failureEvents()).toHaveLength(1);
    expect(failureEvents()[0]).toMatchObject({
      event_type: "hendelser_resolve_failed",
      failure_kind: "unknown",
    });
    expect(mocks.lines.join()).not.toMatch(
      /private-canary|logging_context_invalid/,
    );
  });

  it.each([
    ["not-json", "INVALID_JSON"],
    ['{"hendelseIds":[],"secret":"private-canary"}', "INVALID_HENDELSE_IDS"],
  ])("rejects invalid input with a bounded WARN event", async (body, reason) => {
    const response = await POST(request(body), undefined);
    expect(response.status).toBe(400);
    expect(mocks.lines).toHaveLength(1);
    expect(JSON.parse(mocks.lines[0])).toMatchObject({
      level: "warn",
      event_type: "api_request_rejected",
      operation: "resolve_hendelser",
      rejection_reason: reason,
    });
    expect(mocks.lines[0]).not.toMatch(
      /private-canary|logging_context_invalid/,
    );
  });
});
