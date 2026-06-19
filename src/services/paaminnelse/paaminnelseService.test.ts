import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getPaaminnelseConfig } from "../../utils/env";
import {
  avbestillPaaminnelse,
  bestillPaaminnelse,
  hentPaaminnelseStatus,
  PaaminnelseAdapterError,
} from "./paaminnelseService";

vi.mock("@navikt/oasis", () => ({
  requestOboToken: vi.fn(),
}));

vi.mock("../../utils/env", () => ({
  getPaaminnelseConfig: vi.fn(),
}));

const requestOboTokenMock = vi.mocked(requestOboToken);
const getPaaminnelseConfigMock = vi.mocked(getPaaminnelseConfig);

const NARMESTELEDER_ID = "narmesteleder-1";
const ORGNUMMER = "999888777";
const FNR = "00000000000";
const REQUEST_ID = "mock-request-id";
const BASE_URL = "https://oppfolgingsplan.example.test";
const RESOURCE_URL = `${BASE_URL}/api/v1/narmesteleder/${NARMESTELEDER_ID}/oppfolgingsplaner/paaminnelse`;
const ENCODED_RESOURCE_URL = `${BASE_URL}/api/v1/narmesteleder/leder%2Fmed%20mellomrom%3F/oppfolgingsplaner/paaminnelse`;

const context: ResolverContextType = {
  pid: FNR,
  accessToken: "mock-access-token",
  xRequestId: REQUEST_ID,
};

const writeCases = [
  { name: "bestill", write: bestillPaaminnelse, feilkode: "BESTILLING_FEILET" },
  {
    name: "avbestill",
    write: avbestillPaaminnelse,
    feilkode: "AVBESTILLING_FEILET",
  },
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  getPaaminnelseConfigMock.mockReturnValue({
    url: BASE_URL,
    scope: "dev-gcp:team-esyfo:syfo-oppfolgingsplan-backend",
  });
  requestOboTokenMock.mockResolvedValue({
    ok: true,
    token: "mock-obo-token",
  });
  vi.stubGlobal("fetch", vi.fn());
});

describe("paaminnelseService", () => {
  it("GET skjuler ved manglende konfigurasjon", async () => {
    getPaaminnelseConfigMock.mockReturnValue(null);

    await expect(
      hentPaaminnelseStatus(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "SKJULT", synligFra: null });

    expect(requestOboTokenMock).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("GET leser ressursen og stripper backend-felter", async () => {
    fetchMock().mockResolvedValue(
      createResponse({
        ok: true,
        body: {
          status: "BESTILT",
          reminderTiming: { code: "BEFORE_4_WEEKS" },
        },
      }),
    );

    await expect(
      hentPaaminnelseStatus(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "BESTILT", synligFra: null });

    expect(requestOboTokenMock).toHaveBeenCalledWith(
      context.accessToken,
      "dev-gcp:team-esyfo:syfo-oppfolgingsplan-backend",
    );
    expect(fetch).toHaveBeenCalledWith(
      RESOURCE_URL,
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer mock-obo-token",
          "Nav-Call-Id": REQUEST_ID,
          "Nav-Consumer-Id": "dinesykmeldte",
          "x-request-id": REQUEST_ID,
        },
      }),
    );
    expect(fetchInit()).not.toHaveProperty("body");
  });

  it("GET URL-enkoder narmestelederId i backend-pathen", async () => {
    fetchMock().mockResolvedValue(
      createResponse({ ok: true, body: { status: "TILGJENGELIG" } }),
    );

    await expect(
      hentPaaminnelseStatus("leder/med mellomrom?", context),
    ).resolves.toEqual({ status: "TILGJENGELIG", synligFra: null });

    expect(fetch).toHaveBeenCalledWith(
      ENCODED_RESOURCE_URL,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("GET skjuler uten PII i logg når token-veksling feiler", async () => {
    const warnSpy = spyOnLogger("warn");
    requestOboTokenMock.mockResolvedValue({
      ok: false,
      error: new Error(`sensitive backend error ${ORGNUMMER} ${FNR}`),
    });

    await expect(
      hentPaaminnelseStatus(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "SKJULT", synligFra: null });

    expect(fetch).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
  });

  it("GET skjuler ved ukjent status-verdi", async () => {
    const warnSpy = spyOnLogger("warn");
    fetchMock().mockResolvedValue(
      createResponse({
        ok: true,
        body: { status: "UKJENT_STATUS" },
      }),
    );

    await expect(
      hentPaaminnelseStatus(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "SKJULT", synligFra: null });

    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
  });

  it("GET beholder gyldig status og synligFra, og stripper uventede felt", async () => {
    fetchMock().mockResolvedValue(
      createResponse({
        ok: true,
        body: {
          status: "TILGJENGELIG",
          synligFra: "2026-06-01",
          reminderTiming: { code: 123 },
          nextAllowedAt: "2026-06-17T10:00:00Z",
        },
      }),
    );

    await expect(
      hentPaaminnelseStatus(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "TILGJENGELIG", synligFra: "2026-06-01" });
  });

  it("GET faller tilbake til synligFra null når datoen er ugyldig", async () => {
    fetchMock().mockResolvedValue(
      createResponse({
        ok: true,
        body: { status: "TILGJENGELIG", synligFra: "ikke-en-dato" },
      }),
    );

    await expect(
      hentPaaminnelseStatus(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "TILGJENGELIG", synligFra: null });
  });

  it("GET skjuler (timeout) når kallet avbrytes", async () => {
    const warnSpy = spyOnLogger("warn");
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    fetchMock().mockRejectedValue(abortError);

    await expect(
      hentPaaminnelseStatus(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "SKJULT", synligFra: null });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("timeout"),
    );
    expectLogCallsWithoutPii(warnSpy.mock.calls);
  });

  it("POST bestiller via ressursen", async () => {
    fetchMock().mockResolvedValue(
      createResponse({ ok: true, body: { status: "BESTILT" } }),
    );

    await expect(
      bestillPaaminnelse(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "BESTILT", synligFra: null });

    expect(fetch).toHaveBeenCalledWith(
      RESOURCE_URL,
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchInit()).not.toHaveProperty("body");
  });

  it("DELETE avbestiller via ressursen", async () => {
    fetchMock().mockResolvedValue(
      createResponse({ ok: true, body: { status: "TILGJENGELIG" } }),
    );

    await expect(
      avbestillPaaminnelse(NARMESTELEDER_ID, context),
    ).resolves.toEqual({ status: "TILGJENGELIG", synligFra: null });

    expect(fetch).toHaveBeenCalledWith(
      RESOURCE_URL,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it.each(
    writeCases,
  )("$name kaster $feilkode ved manglende konfigurasjon", async ({
    write,
    feilkode,
  }) => {
    const errorSpy = spyOnLogger("error");
    getPaaminnelseConfigMock.mockReturnValue(null);

    await expect(write(NARMESTELEDER_ID, context)).rejects.toMatchObject(
      new PaaminnelseAdapterError(feilkode),
    );

    expect(requestOboTokenMock).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });

  it.each(
    writeCases,
  )("$name kaster $feilkode ved ikke-2xx-svar fra backend", async ({
    write,
    feilkode,
  }) => {
    const errorSpy = spyOnLogger("error");
    fetchMock().mockResolvedValue(createResponse({ ok: false, body: {} }));

    await expect(write(NARMESTELEDER_ID, context)).rejects.toMatchObject(
      new PaaminnelseAdapterError(feilkode),
    );

    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });
});

function createResponse({
  ok,
  body,
}: {
  ok: boolean;
  body: unknown;
}): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function fetchMock(): ReturnType<typeof vi.fn> {
  return vi.mocked(fetch) as unknown as ReturnType<typeof vi.fn>;
}

function fetchInit(): RequestInit {
  const [, init] = fetchMock().mock.calls[0] ?? [];
  return (init ?? {}) as RequestInit;
}

function expectLogCallsWithoutPii(calls: unknown[][]): void {
  const serializedCalls = JSON.stringify(calls, (_key, value: unknown) => {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}`;
    }

    return value;
  });

  expect(serializedCalls).not.toContain(ORGNUMMER);
  expect(serializedCalls).not.toContain(FNR);
  expect(serializedCalls).not.toContain("sensitive backend error");
}

function spyOnLogger(
  method: "warn" | "error",
): MockInstance<(...args: unknown[]) => void> {
  return vi.spyOn(logger, method).mockImplementation(() => undefined);
}
