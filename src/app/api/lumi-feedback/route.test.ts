import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  lines: [] as string[],
  token: vi.fn(),
  context: vi.fn(),
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
vi.mock("../../../utils/env", () => ({
  isLocalOrDemo: false,
  getServerEnv: () => ({
    LUMI_API_SCOPE: "scope",
    LUMI_API_HOST: "https://lumi.invalid",
  }),
}));
vi.mock("../../../auth/withAuthenticatedApiRoute", () => ({
  withAuthenticatedApiRoute: (handler: unknown) => handler,
  createAppRouterResolverContextType: mocks.context,
}));
describe("Lumi token failure boundary", () => {
  beforeEach(() => {
    mocks.lines.length = 0;
    mocks.token.mockReset();
    mocks.context.mockReset().mockReturnValue({
      accessToken: "secret-idporten-token",
      xRequestId: "safe-request",
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("keeps missing authentication separate from upstream failures", async () => {
    mocks.context.mockReturnValue(null);
    const response = await POST(
      new Request("https://example.test/api/lumi-feedback", { method: "POST" }),
      undefined,
    );
    expect(response.status).toBe(401);
    expect(mocks.token).not.toHaveBeenCalled();
    expect(mocks.lines).toHaveLength(1);
    const record = JSON.parse(mocks.lines[0]);
    expect(record).toMatchObject({
      event_type: "authenticated_context_missing",
      failure_stage: "authentication",
      failure_kind: "token",
      outcome: "rejected",
    });
    expect(record).not.toHaveProperty("error_code");
    expect(record).not.toHaveProperty("upstream");
  });

  it.each([
    [false, undefined],
    [true, undefined],
    [false, "ENOTFOUND"],
    [true, "ETIMEDOUT"],
  ])("diagnoses rejection=%s code=%s without letting provider data reach Next", async (reject, code) => {
    const cause = Object.assign(new Error("secret-provider-body"), { code });
    if (reject) mocks.token.mockRejectedValue(cause);
    else mocks.token.mockResolvedValue({ ok: false, error: cause });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const response = await POST(
      new Request("https://example.test/api/lumi-feedback", { method: "POST" }),
      undefined,
    );
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("secret-");
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.lines).toHaveLength(1);
    expect(JSON.parse(mocks.lines[0])).toMatchObject({
      event_type: "lumi_feedback_submit_failed",
      failure_stage: "token_exchange",
      failure_kind: "token",
      error_code: code ?? "TOKENX_OBO_EXCHANGE_ERROR",
    });
    expect(mocks.lines[0]).not.toContain("secret-");
  });
});
