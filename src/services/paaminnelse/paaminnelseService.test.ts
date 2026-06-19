import { logger } from "@navikt/next-logger";
import * as oasis from "@navikt/oasis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import {
  avbestillPaaminnelse,
  bestillPaaminnelse,
  hentPaaminnelseStatus,
  PaaminnelseAdapterError,
} from "./paaminnelseService";

vi.mock("@navikt/oasis", () => ({
  requestOboToken: vi.fn(),
}));

const mockedRequestOboToken = vi.mocked(oasis.requestOboToken);

const context: ResolverContextType = {
  xRequestId: "mock-request-id",
  accessToken: "mock-access-token",
  pid: "12345678910",
};

const NARMESTELEDER_ID = "narmesteleder-1";
const identifikatorer = {
  narmestelederId: NARMESTELEDER_ID,
  orgnummer: "999888777",
  fnr: "12345678910",
};
const identifikatorerUtenFnr = {
  narmestelederId: NARMESTELEDER_ID,
  orgnummer: "999888777",
};

const originalConfig = {
  url: process.env.OPPFOLGINGSPLAN_BACKEND_URL,
  scope: process.env.OPPFOLGINGSPLAN_BACKEND_SCOPE,
};

const setConfig = () => {
  process.env.OPPFOLGINGSPLAN_BACKEND_URL =
    "https://oppfolgingsplan.example.no";
  process.env.OPPFOLGINGSPLAN_BACKEND_SCOPE = "api://oppfolgingsplan/.default";
};

const clearConfig = () => {
  delete process.env.OPPFOLGINGSPLAN_BACKEND_URL;
  delete process.env.OPPFOLGINGSPLAN_BACKEND_SCOPE;
};

const restoreConfig = () => {
  if (originalConfig.url === undefined) {
    delete process.env.OPPFOLGINGSPLAN_BACKEND_URL;
  } else {
    process.env.OPPFOLGINGSPLAN_BACKEND_URL = originalConfig.url;
  }

  if (originalConfig.scope === undefined) {
    delete process.env.OPPFOLGINGSPLAN_BACKEND_SCOPE;
  } else {
    process.env.OPPFOLGINGSPLAN_BACKEND_SCOPE = originalConfig.scope;
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

describe("hentPaaminnelseStatus", () => {
  it("returns SKJULT and skips OBO/fetch when config is missing", async () => {
    clearConfig();
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "SKJULT" });
    expect(mockedRequestOboToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a TILBUD response", async () => {
    const fetchMock = vi.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit,
      ): Promise<Response> => {
        return jsonResponse({ status: "TILBUD" });
      },
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "TILBUD" });

    expect(mockedRequestOboToken).toHaveBeenCalledWith(
      context.accessToken,
      "api://oppfolgingsplan/.default",
    );
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://oppfolgingsplan.example.no/api/v1/narmesteleder/narmesteleder-1/oppfolgingsplaner/paaminnelse",
    );
    expect(init).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer obo-token",
          "Content-Type": "application/json",
          "x-request-id": "mock-request-id",
        }),
        signal: expect.any(AbortSignal),
      }),
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      orgnummer: "999888777",
      fnr: "12345678910",
    });
  });

  it("URL-encodes narmestelederId in the backend path", async () => {
    const fetchMock = vi.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit,
      ): Promise<Response> => {
        return jsonResponse({ status: "TILBUD" });
      },
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(
        {
          ...identifikatorer,
          narmestelederId: "leder/med mellomrom?",
        },
        context,
      ),
    ).resolves.toEqual({ status: "TILBUD" });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://oppfolgingsplan.example.no/api/v1/narmesteleder/leder%2Fmed%20mellomrom%3F/oppfolgingsplaner/paaminnelse",
    );
  });

  it("returns SKJULT when OBO exchange fails", async () => {
    mockedRequestOboToken.mockResolvedValue({
      ok: false,
      error: new Error("unable to exchange token"),
    });
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "SKJULT" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns SKJULT when OBO exchange throws", async () => {
    mockedRequestOboToken.mockRejectedValue(new Error("token service down"));
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "SKJULT" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a BESTILT response", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return jsonResponse({ status: "BESTILT" });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "BESTILT" });
  });

  it("returns SKJULT on non-2xx responses", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return new Response(null, {
        status: 500,
        statusText: "Internal Server Error",
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "SKJULT" });
  });

  it("returns SKJULT when fetch rejects", async () => {
    const warnSpy = vi
      .spyOn(logger, "warn")
      .mockImplementation(() => undefined);
    const fetchMock = vi.fn(async (): Promise<Response> => {
      throw new Error("network down");
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "SKJULT" });
    expectLogCallsWithoutPii(warnSpy.mock.calls);
    warnSpy.mockRestore();
  });

  it("returns SKJULT when the response body cannot be parsed as JSON", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return new Response("not json", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "SKJULT" });
  });

  it("returns SKJULT when the backend returns unexpected fields", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return jsonResponse({
        status: "BESTILT",
        uventetFelt: "noe",
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expect(
      hentPaaminnelseStatus(identifikatorer, context),
    ).resolves.toEqual({ status: "SKJULT" });
  });

  it("returns SKJULT when the request times out and aborts", async () => {
    vi.useFakeTimers();
    const fetchMock = createAbortAwareFetch();
    global.fetch = fetchMock as typeof fetch;

    const resultPromise = hentPaaminnelseStatus(identifikatorer, context);

    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual({ status: "SKJULT" });
  });
});

describe("bestillPaaminnelse", () => {
  it("throws a sanitized fixed-code error and skips OBO/fetch when config is missing", async () => {
    clearConfig();
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      bestillPaaminnelse(identifikatorer, context),
      "BESTILLING_FEILET",
    );
    expect(mockedRequestOboToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns mapped status and sends no timing choice", async () => {
    const fetchMock = vi.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit,
      ): Promise<Response> => {
        return jsonResponse({ status: "BESTILT" });
      },
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(bestillPaaminnelse(identifikatorer, context)).resolves.toEqual(
      { status: "BESTILT" },
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://oppfolgingsplan.example.no/api/v1/narmesteleder/narmesteleder-1/oppfolgingsplaner/paaminnelse",
    );
    expect(init).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer obo-token",
          "Content-Type": "application/json",
          "x-request-id": "mock-request-id",
        }),
        signal: expect.any(AbortSignal),
      }),
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      orgnummer: "999888777",
      fnr: "12345678910",
    });
  });

  it("sends only orgnummer when fnr is not available", async () => {
    const fetchMock = vi.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit,
      ): Promise<Response> => {
        return jsonResponse({
          status: "BESTILT",
        });
      },
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(
      bestillPaaminnelse(identifikatorerUtenFnr, context),
    ).resolves.toEqual({
      status: "BESTILT",
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      orgnummer: "999888777",
    });
  });

  it("throws a sanitized fixed-code error on OBO failure", async () => {
    mockedRequestOboToken.mockResolvedValue({
      ok: false,
      error: new Error("sensitive-token-error"),
    });
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      bestillPaaminnelse(identifikatorer, context),
      "BESTILLING_FEILET",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws a sanitized fixed-code error when OBO exchange throws", async () => {
    mockedRequestOboToken.mockRejectedValue(new Error("sensitive-token-error"));
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      bestillPaaminnelse(identifikatorer, context),
      "BESTILLING_FEILET",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws a sanitized fixed-code error on non-2xx responses", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return new Response(null, {
        status: 500,
        statusText: "Internal Server Error",
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      bestillPaaminnelse(identifikatorer, context),
      "BESTILLING_FEILET",
    );
  });

  it("throws a sanitized fixed-code error when the backend returns unexpected fields", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return jsonResponse({
        status: "BESTILT",
        uventetFelt: "noe",
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      bestillPaaminnelse(identifikatorer, context),
      "BESTILLING_FEILET",
    );
  });

  it("throws a sanitized fixed-code error when fetch rejects", async () => {
    const errorSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => undefined);
    const fetchMock = vi.fn(async (): Promise<Response> => {
      throw new Error("sensitive-backend-message");
    });
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      bestillPaaminnelse(identifikatorer, context),
      "BESTILLING_FEILET",
    );
    expectLogCallsWithoutPii(errorSpy.mock.calls);
    errorSpy.mockRestore();
  });
});

describe("avbestillPaaminnelse", () => {
  it("throws a sanitized fixed-code error and skips OBO/fetch when config is missing", async () => {
    clearConfig();
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      avbestillPaaminnelse(identifikatorer, context),
      "AVBESTILLING_FEILET",
    );
    expect(mockedRequestOboToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns mapped status and sends no timing choice", async () => {
    const fetchMock = vi.fn(
      async (
        _input: RequestInfo | URL,
        _init?: RequestInit,
      ): Promise<Response> => {
        return jsonResponse({
          status: "TILBUD",
        });
      },
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(
      avbestillPaaminnelse(identifikatorer, context),
    ).resolves.toEqual({ status: "TILBUD" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://oppfolgingsplan.example.no/api/v1/narmesteleder/narmesteleder-1/oppfolgingsplaner/paaminnelse",
    );
    expect(init).toEqual(
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer obo-token",
          "Content-Type": "application/json",
          "x-request-id": "mock-request-id",
        }),
        signal: expect.any(AbortSignal),
      }),
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      orgnummer: "999888777",
      fnr: "12345678910",
    });
  });

  it("throws a sanitized fixed-code error on non-2xx responses", async () => {
    const fetchMock = vi.fn(async (): Promise<Response> => {
      return new Response(null, {
        status: 502,
        statusText: "Bad Gateway",
      });
    });
    global.fetch = fetchMock as typeof fetch;

    await expectSanitizedError(
      avbestillPaaminnelse(identifikatorer, context),
      "AVBESTILLING_FEILET",
    );
  });

  it("throws a sanitized fixed-code error when the request times out and aborts", async () => {
    vi.useFakeTimers();
    const fetchMock = createAbortAwareFetch();
    global.fetch = fetchMock as typeof fetch;

    const resultPromise = avbestillPaaminnelse(identifikatorer, context);
    const assertionPromise = expectSanitizedError(
      resultPromise,
      "AVBESTILLING_FEILET",
    );

    await vi.runAllTimersAsync();

    await assertionPromise;
  });
});

async function expectSanitizedError(
  promise: Promise<unknown>,
  feilkode: "BESTILLING_FEILET" | "AVBESTILLING_FEILET",
): Promise<void> {
  const error = await promise.then(
    () => {
      throw new Error("Expected promise to reject");
    },
    (caughtError) => caughtError,
  );

  expect(error).toBeInstanceOf(PaaminnelseAdapterError);
  expect(error).toMatchObject({
    message: feilkode,
    feilkode,
  });
  expect(error.message).not.toContain("999888777");
  expect(error.message).not.toContain("12345678910");
  expect(error.message).not.toContain("sensitive-backend-message");
  expect(error.message).not.toContain("sensitive-token-error");
  expect(error.message).not.toContain("Bad Gateway");
  expect(error.message).not.toContain("Internal Server Error");
}

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
