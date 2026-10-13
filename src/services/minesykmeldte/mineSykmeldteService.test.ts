import { logger } from "@navikt/next-logger";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReadType } from "../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { failureDiagnostics } from "../../observability/serverLog";
import {
  getVirksomheter,
  markAllSykmeldingerAndSoknaderAsRead,
  markRead,
  unlinkSykmeldt,
} from "./mineSykmeldteService";

vi.mock("@navikt/oasis", () => ({
  requestOboToken: async () => ({ ok: true, token: "mock-token" }),
  isInvalidTokenSet: () => false,
}));
const context: ResolverContextType = {
  xRequestId: "mock-request-id",
  accessToken: "mock-token",
  pid: "pid-111",
};

describe("markRead", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [ReadType.Hendelse, "hendelse/test-id/lest"],
    [ReadType.Soknad, "soknad/test-id/lest"],
    [ReadType.Sykmelding, "sykmelding/test-id/lest"],
  ])("marks %s as read using its existing backend endpoint", async (type, path) => {
    const fetchMock = vi.fn(async () =>
      Response.json({ message: "OK" }, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(markRead(type, "test-id", context)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(`/api/${path}`),
      expect.objectContaining({ method: "PUT" }),
    );
  });
});

describe("getVirksomheter", () => {
  it("should throw when response is not in 404", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 404,
          statusText: "Not Found",
          ok: false,
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      "Dine sykmeldte backend request failed",
    );
  });

  describe("unexpected successful HTTP status on write", () => {
    it.each([
      ["markRead", () => markRead(ReadType.Hendelse, "test-id", context)],
      ["unlinkSykmeldt", () => unlinkSykmeldt("test-id", context)],
      ["markAllRead", () => markAllSykmeldingerAndSoknaderAsRead(context)],
    ])("%s retains the status but not the backend message", async (_name, write) => {
      const secret = "private-canary";
      const infoSpy = vi
        .spyOn(logger, "info")
        .mockImplementation(() => undefined);
      global.fetch = vi.fn(async () =>
        Response.json({ message: secret }, { status: 202 }),
      );
      const error = await write().catch((cause: unknown) => cause);
      infoSpy.mockRestore();
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(secret);
      expect(failureDiagnostics(error)).toMatchObject({
        failure_kind: "http",
        failure_stage: "response",
        upstream_status: 202,
        error_code: "UPSTREAM_UNEXPECTED_STATUS",
      });
    });
  });

  it("should throw when response is not in 500", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 500,
          statusText: "Internal Server Error",
          ok: false,
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      "Dine sykmeldte backend request failed",
    );
  });

  it("should preserve parse cause without copying response text into the error", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 200,
          statusText: "OK",
          ok: true,
          json: () => Promise.reject("Fake JSON parse error"),
          text: () => Promise.resolve("Some text error"),
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      "Dine sykmeldte backend did not return valid JSON",
    );
  });

  it("should throw error when zod parsing fails", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 200,
          statusText: "OK",
          ok: true,
          json: () => Promise.resolve({ some: "garbage", response: "true" }),
        }) as Response,
    );

    await expect(getVirksomheter(context)).rejects.toThrowError(
      "Dine sykmeldte response did not match expected schema",
    );
  });

  it("should be happy when zod parsing succeeds", async () => {
    global.fetch = vi.fn(
      async (): Promise<Response> =>
        ({
          status: 200,
          statusText: "OK",
          ok: true,
          json: () =>
            Promise.resolve([{ navn: "Fakesomehet", orgnummer: "42" }]),
        }) as Response,
    );

    expect(await getVirksomheter(context)).toEqual([
      { navn: "Fakesomehet", orgnummer: "42" },
    ]);
  });
});
