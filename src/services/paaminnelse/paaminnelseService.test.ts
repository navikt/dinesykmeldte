import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getPaaminnelseConfig } from "../../utils/env";
import {
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

const ORGNUMMER = "999888777";
const FNR = "00000000000";
const REQUEST_ID = "mock-request-id";

const context: ResolverContextType = {
  pid: FNR,
  accessToken: "mock-access-token",
  xRequestId: REQUEST_ID,
};

beforeEach(() => {
  vi.clearAllMocks();
  getPaaminnelseConfigMock.mockReturnValue({
    url: "https://oppfolgingsplan.example.test",
    scope: "dev-gcp:team-esyfo:syfo-oppfolgingsplan-backend",
  });
  requestOboTokenMock.mockResolvedValue({
    ok: true,
    token: "mock-obo-token",
  });
  vi.stubGlobal("fetch", vi.fn());
});

describe("paaminnelseService", () => {
  it("GET status fails closed when config is missing", async () => {
    getPaaminnelseConfigMock.mockReturnValue(null);

    await expect(
      hentPaaminnelseStatus({ orgnummer: ORGNUMMER, fnr: FNR }, context),
    ).resolves.toEqual({ status: "SKJULT" });

    expect(requestOboTokenMock).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("GET status posts server-side identifiers and strips backend-only fields", async () => {
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
      hentPaaminnelseStatus({ orgnummer: ORGNUMMER, fnr: FNR }, context),
    ).resolves.toEqual({ status: "BESTILT" });

    expect(requestOboTokenMock).toHaveBeenCalledWith(
      context.accessToken,
      "dev-gcp:team-esyfo:syfo-oppfolgingsplan-backend",
    );
    expect(fetch).toHaveBeenCalledWith(
      "https://oppfolgingsplan.example.test/api/oppfolgingsplan/paaminnelse/status",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer mock-obo-token",
          "Content-Type": "application/json",
          "Nav-Call-Id": REQUEST_ID,
          "Nav-Consumer-Id": "dinesykmeldte",
          "x-request-id": REQUEST_ID,
        }),
        body: JSON.stringify({ orgnummer: ORGNUMMER, fnr: FNR }),
      }),
    );
  });

  it("GET status fails closed without PII in logs when token exchange fails", async () => {
    const warnSpy = spyOnLogger("warn");
    requestOboTokenMock.mockResolvedValue({
      ok: false,
      error: new Error(`sensitive backend error ${ORGNUMMER} ${FNR}`),
    });

    await expect(
      hentPaaminnelseStatus({ orgnummer: ORGNUMMER, fnr: FNR }, context),
    ).resolves.toEqual({ status: "SKJULT" });

    expect(fetch).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
  });

  it("GET status fails closed for an unknown status value", async () => {
    const warnSpy = spyOnLogger("warn");
    fetchMock().mockResolvedValue(
      createResponse({
        ok: true,
        body: { status: "UKJENT_STATUS" },
      }),
    );

    await expect(
      hentPaaminnelseStatus({ orgnummer: ORGNUMMER, fnr: FNR }, context),
    ).resolves.toEqual({ status: "SKJULT" });

    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
  });

  it("GET status keeps a valid status and strips unexpected backend fields", async () => {
    fetchMock().mockResolvedValue(
      createResponse({
        ok: true,
        body: {
          status: "BESTILT",
          reminderTiming: { code: 123 },
          nextAllowedAt: "2026-06-17T10:00:00Z",
        },
      }),
    );

    await expect(
      hentPaaminnelseStatus({ orgnummer: ORGNUMMER, fnr: FNR }, context),
    ).resolves.toEqual({ status: "BESTILT" });
  });

  it("write throws fixed adapter error when config is missing", async () => {
    const errorSpy = spyOnLogger("error");
    getPaaminnelseConfigMock.mockReturnValue(null);

    await expect(
      bestillPaaminnelse({ orgnummer: ORGNUMMER, fnr: FNR }, context),
    ).rejects.toMatchObject(new PaaminnelseAdapterError("BESTILLING_FEILET"));

    expect(requestOboTokenMock).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });

  it("write throws fixed adapter error for non-2xx backend response", async () => {
    const errorSpy = spyOnLogger("error");
    fetchMock().mockResolvedValue(createResponse({ ok: false, body: {} }));

    await expect(
      bestillPaaminnelse({ orgnummer: ORGNUMMER, fnr: FNR }, context),
    ).rejects.toMatchObject(new PaaminnelseAdapterError("BESTILLING_FEILET"));

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
