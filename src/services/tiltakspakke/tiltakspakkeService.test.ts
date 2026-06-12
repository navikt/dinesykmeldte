import { logger } from "@navikt/next-logger";
import * as oasis from "@navikt/oasis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getTiltakspakkeStatus } from "./tiltakspakkeService";

vi.mock("@navikt/oasis", () => ({
  requestOboToken: vi.fn(),
}));

const mockedRequestOboToken = vi.mocked(oasis.requestOboToken);

const context: ResolverContextType = {
  xRequestId: "mock-request-id",
  accessToken: "mock-access-token",
  pid: "12345678910",
};

const originalConfig = {
  url: process.env.TILTAKSPAKKE_API_URL,
  scope: process.env.TILTAKSPAKKE_API_SCOPE,
  featureToggle: process.env.PAAMINNELSE_FEATURE_TOGGLE,
};

const setConfig = () => {
  process.env.TILTAKSPAKKE_API_URL = "https://tiltakspakke.example.no";
  process.env.TILTAKSPAKKE_API_SCOPE = "api://tiltakspakke/.default";
};

const clearConfig = () => {
  delete process.env.TILTAKSPAKKE_API_URL;
  delete process.env.TILTAKSPAKKE_API_SCOPE;
  delete process.env.PAAMINNELSE_FEATURE_TOGGLE;
};

const restoreConfig = () => {
  if (originalConfig.url === undefined) {
    delete process.env.TILTAKSPAKKE_API_URL;
  } else {
    process.env.TILTAKSPAKKE_API_URL = originalConfig.url;
  }

  if (originalConfig.scope === undefined) {
    delete process.env.TILTAKSPAKKE_API_SCOPE;
  } else {
    process.env.TILTAKSPAKKE_API_SCOPE = originalConfig.scope;
  }

  if (originalConfig.featureToggle === undefined) {
    delete process.env.PAAMINNELSE_FEATURE_TOGGLE;
  } else {
    process.env.PAAMINNELSE_FEATURE_TOGGLE = originalConfig.featureToggle;
  }
};

const jsonResponse = (body: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

const createAbortAwareFetch = () =>
  vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      const abortWithError = () =>
        reject(new DOMException("The operation was aborted.", "AbortError"));

      if (init?.signal?.aborted) {
        abortWithError();
        return;
      }

      init?.signal?.addEventListener("abort", abortWithError, { once: true });
    });
  });

beforeEach(() => {
  setConfig();
  mockedRequestOboToken.mockResolvedValue({
    ok: true,
    token: "obo-token",
  });
});

afterEach(() => {
  restoreConfig();
  vi.useRealTimers();
});

describe("getTiltakspakkeStatus", () => {
  it("returns UKJENT and skips OBO/fetch when config is missing", async () => {
    clearConfig();
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "UKJENT",
    );
    expect(mockedRequestOboToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns DELTAR_I_TILTAKSGRUPPE without OBO/fetch when config is missing and temporary feature toggle is enabled", async () => {
    clearConfig();
    process.env.PAAMINNELSE_FEATURE_TOGGLE = "true";
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "DELTAR_I_TILTAKSGRUPPE",
    );
    expect(mockedRequestOboToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns UKJENT when OBO exchange fails", async () => {
    mockedRequestOboToken.mockResolvedValue({
      ok: false,
      error: new Error("unable to exchange token"),
    });
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "UKJENT",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns UKJENT when OBO exchange throws", async () => {
    mockedRequestOboToken.mockRejectedValue(new Error("token service down"));
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "UKJENT",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    "DELTAR_I_TILTAKSGRUPPE",
    "DELTAR_I_KONTROLLGRUPPE",
    "IKKE_I_MAALGRUPPE",
    "IKKE_AKTIV",
  ] as const)("parses %s status", async (status) => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return jsonResponse({
        tiltakspakke: "TILTAKSPAKKE_1",
        status,
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      status,
    );
  });

  it("requests an OBO token with the configured scope and calls the expected URL", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return jsonResponse({
        tiltakspakke: "TILTAKSPAKKE_1",
        status: "DELTAR_I_TILTAKSGRUPPE",
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "DELTAR_I_TILTAKSGRUPPE",
    );

    expect(mockedRequestOboToken).toHaveBeenCalledWith(
      context.accessToken,
      "api://tiltakspakke/.default",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://tiltakspakke.example.no/api/tiltakspakker/TILTAKSPAKKE_1/vurdering?orgnummer=999888777",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer obo-token",
          "x-request-id": "mock-request-id",
        }),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("returns UKJENT on non-2xx responses", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return new Response(null, {
        status: 503,
        statusText: "Service Unavailable",
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "UKJENT",
    );
  });

  it("returns UKJENT when fetch rejects", async () => {
    const warnSpy = vi
      .spyOn(logger, "warn")
      .mockImplementation(() => undefined);
    const fetchMock = vi.fn(async (): Promise<Response> => {
      throw new Error("network down");
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "UKJENT",
    );
    expectLogCallsWithoutPii(warnSpy.mock.calls);
    warnSpy.mockRestore();
  });

  it("returns UKJENT when the response body cannot be parsed as JSON", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return new Response("not json", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "UKJENT",
    );
  });

  it("returns UKJENT when the backend returns an unknown status", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return jsonResponse({
        tiltakspakke: "TILTAKSPAKKE_1",
        status: "UKJENT_FRA_BACKEND",
      });
    });

    global.fetch = fetchMock as typeof fetch;

    await expect(getTiltakspakkeStatus("999888777", context)).resolves.toBe(
      "UKJENT",
    );
  });

  it("returns UKJENT when the request times out and aborts", async () => {
    vi.useFakeTimers();
    const fetchMock = createAbortAwareFetch();
    global.fetch = fetchMock as typeof fetch;

    const resultPromise = getTiltakspakkeStatus("999888777", context);

    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toBe("UKJENT");
  });
});

function expectLogCallsWithoutPii(calls: unknown[][]): void {
  expect(calls.length).toBeGreaterThan(0);
  const serializedCalls = JSON.stringify(calls, (_key, value: unknown) => {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}`;
    }

    return value;
  });

  expect(serializedCalls).not.toContain("999888777");
  expect(serializedCalls).not.toContain("12345678910");
}
