import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

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
vi.mock("../../../utils/env", () => ({
  isLocalOrDemo: false,
  getServerEnv: () => ({
    LUMI_API_SCOPE: "scope",
    LUMI_API_HOST: "https://lumi.invalid",
  }),
}));
vi.mock("../../../auth/withAuthenticatedApiRoute", () => ({
  withAuthenticatedApiRoute: (handler: unknown) => handler,
  createAppRouterResolverContextType: () => ({
    accessToken: "secret-idporten-token",
    xRequestId: "safe-request",
  }),
}));
describe("Lumi token failure boundary", () => {
  beforeEach(() => {
    mocks.lines.length = 0;
    mocks.token.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());
  it.each([
    [false, undefined, "token"],
    [true, undefined, "token"],
    [false, "ENOTFOUND", "dns"],
    [true, "ETIMEDOUT", "timeout"],
  ])("diagnoses rejection=%s code=%s without letting provider data reach Next", async (reject, code, kind) => {
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
      failure_kind: kind,
    });
    expect(mocks.lines[0]).not.toContain("secret-");
  });
});
