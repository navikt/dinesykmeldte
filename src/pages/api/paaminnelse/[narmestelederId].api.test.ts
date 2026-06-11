import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Mock, MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PreviewSykmeldt } from "../../../graphql/resolvers/resolvers.generated";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import type {
  PaaminnelseFeilResponse,
  PaaminnelseStatus,
} from "../../../services/paaminnelse/paaminnelseContract";
import { PaaminnelseAdapterError } from "../../../services/paaminnelse/paaminnelseService";

const {
  createResolverContextTypeMock,
  getMineSykmeldteMock,
  getTiltakspakkeStatusMock,
  hentPaaminnelseStatusMock,
  bestillPaaminnelseMock,
  avbestillPaaminnelseMock,
} = vi.hoisted(() => ({
  createResolverContextTypeMock: vi.fn(),
  getMineSykmeldteMock: vi.fn(),
  getTiltakspakkeStatusMock: vi.fn(),
  hentPaaminnelseStatusMock: vi.fn(),
  bestillPaaminnelseMock: vi.fn(),
  avbestillPaaminnelseMock: vi.fn(),
}));

vi.mock("../../../auth/withAuthentication", () => ({
  createResolverContextType: createResolverContextTypeMock,
  withAuthenticatedApi: vi.fn((handler) => handler),
}));

vi.mock("../../../services/minesykmeldte/mineSykmeldteService", () => ({
  getMineSykmeldte: getMineSykmeldteMock,
}));

vi.mock("../../../services/tiltakspakke/tiltakspakkeService", () => ({
  getTiltakspakkeStatus: getTiltakspakkeStatusMock,
}));

vi.mock("../../../services/paaminnelse/paaminnelseService", async () => {
  const actual = (await vi.importActual(
    "../../../services/paaminnelse/paaminnelseService",
  )) satisfies typeof import("../../../services/paaminnelse/paaminnelseService");

  return {
    ...actual,
    hentPaaminnelseStatus: hentPaaminnelseStatusMock,
    bestillPaaminnelse: bestillPaaminnelseMock,
    avbestillPaaminnelse: avbestillPaaminnelseMock,
  };
});

import handler from "./[narmestelederId].api";

const ROUTE_PARAM = "narmesteleder-1";
const OTHER_ROUTE_PARAM = "narmesteleder-2";
const ORGNUMMER = "999888777";
const FNR = "00000000000";
const REQUEST_ID = "mock-request-id";

const resolverContextType: ResolverContextType = {
  pid: FNR,
  accessToken: "mock-access-token",
  xRequestId: REQUEST_ID,
};

const authorizedSykmeldt = createPreviewSykmeldt({
  narmestelederId: ROUTE_PARAM,
  orgnummer: ORGNUMMER,
  fnr: FNR,
});

beforeEach(() => {
  vi.clearAllMocks();

  createResolverContextTypeMock.mockReturnValue(resolverContextType);
  getMineSykmeldteMock.mockResolvedValue([authorizedSykmeldt]);
  getTiltakspakkeStatusMock.mockResolvedValue("DELTAR_I_TILTAKSGRUPPE");
  hentPaaminnelseStatusMock.mockResolvedValue({ status: "BESTILT" });
  bestillPaaminnelseMock.mockResolvedValue({ status: "BESTILT" });
  avbestillPaaminnelseMock.mockResolvedValue({ status: "TILBUD" });
});

describe("paaminnelse API route", () => {
  it("returns 405 with Allow header for unsupported methods", async () => {
    const request = createFakeReq({ method: "PUT" });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.mockSetHeader).toHaveBeenCalledWith(
      "Allow",
      "GET, POST, DELETE",
    );
    expect(response.statusCode).toBe(405);
    expect(response.body).toEqual({ feilkode: "UGYLDIG_FORESPORSEL" });
    expectSerializedWithoutPii(response.body);
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expectNoAdapterCalls();
  });

  it("returns 401 when resolver context is missing", async () => {
    createResolverContextTypeMock.mockReturnValue(null);
    const request = createFakeReq();
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(response.body);
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expectNoAdapterCalls();
  });

  it("returns 403 and skips adapter calls when route param is not authorized", async () => {
    const warnSpy = spyOnLogger("warn");
    const request = createFakeReq({ narmestelederId: OTHER_ROUTE_PARAM });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(response.body);
    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
    expect(getMineSykmeldteMock).toHaveBeenCalledWith(resolverContextType);
    expectNoAdapterCalls();
  });

  it.each([
    { name: "empty", narmestelederId: "" },
    {
      name: "array",
      narmestelederId: [ROUTE_PARAM, OTHER_ROUTE_PARAM] as string[],
    },
  ] as const)("returns 400 and skips authorization when route param is $name", async ({
    narmestelederId,
  }) => {
    const warnSpy = spyOnLogger("warn");
    const request = createFakeReq({ narmestelederId });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ feilkode: "UGYLDIG_FORESPORSEL" });
    expectSerializedWithoutPii(response.body);
    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expectNoAdapterCalls();
  });

  it("GET fetches status for tiltaksgruppe and returns the mapped response", async () => {
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();
    const paaminnelseStatus: PaaminnelseStatus = {
      status: "BESTILT",
      reminderTiming: {
        code: "BEFORE_4_WEEKS",
      },
    };
    hentPaaminnelseStatusMock.mockResolvedValue(paaminnelseStatus);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(paaminnelseStatus);
    expectSerializedWithoutPii(response.body);
    expect(getMineSykmeldteMock).toHaveBeenCalledWith(resolverContextType);
    expect(getTiltakspakkeStatusMock).toHaveBeenCalledWith(
      ORGNUMMER,
      resolverContextType,
    );
    expect(hentPaaminnelseStatusMock).toHaveBeenCalledWith(
      { orgnummer: ORGNUMMER, fnr: FNR },
      resolverContextType,
    );
    expect(getTiltakspakkeStatusMock.mock.invocationCallOrder[0]).toBeLessThan(
      hentPaaminnelseStatusMock.mock.invocationCallOrder[0],
    );
  });

  it.each([
    "DELTAR_I_KONTROLLGRUPPE",
    "IKKE_I_MAALGRUPPE",
    "IKKE_AKTIV",
    "UKJENT",
  ] as const)("GET returns SKJULT and skips paaminnelse status when tiltakspakke is %s", async (tiltakspakkeStatus) => {
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();
    getTiltakspakkeStatusMock.mockResolvedValue(tiltakspakkeStatus);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "SKJULT" });
    expectSerializedWithoutPii(response.body);
    expect(hentPaaminnelseStatusMock).not.toHaveBeenCalled();
  });

  it("POST bestiller paaminnelse for tiltaksgruppe", async () => {
    const request = createFakeReq({ method: "POST", body: {} });
    const response = createFakeRes();
    const bestillResponse: PaaminnelseStatus = {
      status: "BESTILT",
      reminderTiming: {
        code: "BEFORE_4_WEEKS",
      },
    };
    bestillPaaminnelseMock.mockResolvedValue(bestillResponse);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(bestillResponse);
    expectSerializedWithoutPii(response.body);
    expect(getTiltakspakkeStatusMock).toHaveBeenCalledWith(
      ORGNUMMER,
      resolverContextType,
    );
    expect(bestillPaaminnelseMock).toHaveBeenCalledWith(
      { orgnummer: ORGNUMMER, fnr: FNR },
      resolverContextType,
    );
    expect(getTiltakspakkeStatusMock.mock.invocationCallOrder[0]).toBeLessThan(
      bestillPaaminnelseMock.mock.invocationCallOrder[0],
    );
  });

  it("POST rejects body with timing choice", async () => {
    const request = createFakeReq({
      method: "POST",
      body: { dagerForFrist: 7 },
    });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ feilkode: "UGYLDIG_FORESPORSEL" });
    expectSerializedWithoutPii(response.body);
    expect(bestillPaaminnelseMock).not.toHaveBeenCalled();
  });

  it("DELETE avbestiller paaminnelse for tiltaksgruppe", async () => {
    const request = createFakeReq({ method: "DELETE" });
    const response = createFakeRes();
    const avbestillResponse: PaaminnelseStatus = { status: "TILBUD" };
    avbestillPaaminnelseMock.mockResolvedValue(avbestillResponse);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(avbestillResponse);
    expectSerializedWithoutPii(response.body);
    expect(getTiltakspakkeStatusMock).toHaveBeenCalledWith(
      ORGNUMMER,
      resolverContextType,
    );
    expect(avbestillPaaminnelseMock).toHaveBeenCalledWith(
      { orgnummer: ORGNUMMER, fnr: FNR },
      resolverContextType,
    );
    expect(getTiltakspakkeStatusMock.mock.invocationCallOrder[0]).toBeLessThan(
      avbestillPaaminnelseMock.mock.invocationCallOrder[0],
    );
  });

  it.each([
    { method: "POST", adapterMock: bestillPaaminnelseMock },
    { method: "DELETE", adapterMock: avbestillPaaminnelseMock },
  ] as const)("$method returns 403 and skips write adapter for non-tiltaksgruppe", async ({
    method,
    adapterMock,
  }) => {
    const request = createFakeReq({ method });
    const response = createFakeRes();
    getTiltakspakkeStatusMock.mockResolvedValue("UKJENT");

    await handler(request, response.res);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(response.body);
    expect(adapterMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      method: "POST",
      feilkode: "BESTILLING_FEILET",
      adapterMock: bestillPaaminnelseMock,
    },
    {
      method: "DELETE",
      feilkode: "AVBESTILLING_FEILET",
      adapterMock: avbestillPaaminnelseMock,
    },
  ] as const)("$method maps adapter write errors to 502 with a fixed feilkode", async ({
    method,
    feilkode,
    adapterMock,
  }) => {
    const request = createFakeReq({ method });
    const response = createFakeRes();
    adapterMock.mockRejectedValue(new PaaminnelseAdapterError(feilkode));

    await handler(request, response.res);

    expect(response.statusCode).toBe(502);
    expect(response.body).toEqual({ feilkode });
    expectSerializedWithoutPii(response.body);
  });

  it.each([
    {
      method: "POST",
      feilkode: "BESTILLING_FEILET",
      adapterMock: bestillPaaminnelseMock,
    },
    {
      method: "DELETE",
      feilkode: "AVBESTILLING_FEILET",
      adapterMock: avbestillPaaminnelseMock,
    },
  ] as const)("$method maps unexpected write errors to a fixed feilkode", async ({
    method,
    feilkode,
    adapterMock,
  }) => {
    const errorSpy = spyOnLogger("error");
    const request = createFakeReq({ method });
    const response = createFakeRes();
    adapterMock.mockRejectedValue(
      new Error(`sensitive-backend-message for ${ORGNUMMER} and ${FNR}`),
    );

    await handler(request, response.res);

    expect(response.statusCode).toBe(502);
    expect(response.body).toEqual({ feilkode });
    expectSerializedWithoutPii(response.body);
    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });

  it("returns a sanitized fixed-code error when an upstream dependency throws", async () => {
    const errorSpy = spyOnLogger("error");
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();
    getMineSykmeldteMock.mockRejectedValue(
      new Error(`sensitive-backend-message for ${ORGNUMMER} and ${FNR}`),
    );

    await handler(request, response.res);

    expect(response.statusCode).toBe(502);
    expect(response.body).toEqual({ feilkode: "STATUS_FEILET" });
    expectSerializedWithoutPii(response.body);
    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });
});

function createFakeReq({
  method = "GET",
  narmestelederId = ROUTE_PARAM,
  body,
}: {
  method?: string;
  narmestelederId?: string | string[];
  body?: unknown;
} = {}): NextApiRequest {
  return {
    method,
    body,
    query: { narmestelederId },
    headers: {},
  } as unknown as NextApiRequest;
}

function createFakeRes(): {
  res: NextApiResponse<PaaminnelseStatus | PaaminnelseFeilResponse>;
  body: PaaminnelseStatus | PaaminnelseFeilResponse | null;
  statusCode: number | null;
  mockSetHeader: Mock;
} {
  let body: PaaminnelseStatus | PaaminnelseFeilResponse | null = null;
  let statusCode: number | null = null;
  const mockSetHeader = vi.fn();
  const response = {
    json: vi.fn((jsonBody: PaaminnelseStatus | PaaminnelseFeilResponse) => {
      body = jsonBody;
      return response;
    }),
    status: vi.fn((nextStatusCode: number) => {
      statusCode = nextStatusCode;
      return response;
    }),
    setHeader: mockSetHeader,
  } as unknown as NextApiResponse<PaaminnelseStatus | PaaminnelseFeilResponse>;

  return {
    res: response,
    get body() {
      return body;
    },
    get statusCode() {
      return statusCode;
    },
    mockSetHeader,
  };
}

function createPreviewSykmeldt({
  narmestelederId,
  orgnummer,
  fnr,
}: {
  narmestelederId: string;
  orgnummer: string;
  fnr: string;
}): PreviewSykmeldt {
  return {
    navn: "Syntetisk sykmeldt",
    fnr,
    friskmeldt: false,
    narmestelederId,
    orgnavn: "Syntetisk arbeidsgiver",
    orgnummer,
    aktivitetsvarsler: [],
    dialogmoter: [],
    oppfolgingsplaner: [],
    previewSoknader: [],
    sykmeldinger: [],
  };
}

function expectNoAdapterCalls(): void {
  expect(getTiltakspakkeStatusMock).not.toHaveBeenCalled();
  expect(hentPaaminnelseStatusMock).not.toHaveBeenCalled();
  expect(bestillPaaminnelseMock).not.toHaveBeenCalled();
  expect(avbestillPaaminnelseMock).not.toHaveBeenCalled();
}

function expectSerializedWithoutPii(value: unknown): void {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain(ROUTE_PARAM);
  expect(serialized).not.toContain(OTHER_ROUTE_PARAM);
  expect(serialized).not.toContain(ORGNUMMER);
  expect(serialized).not.toContain(FNR);
}

function expectLogCallsWithoutPii(calls: unknown[][]): void {
  const serializedCalls = JSON.stringify(calls, (_key, value: unknown) => {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}`;
    }

    return value;
  });

  expect(serializedCalls).not.toContain(ROUTE_PARAM);
  expect(serializedCalls).not.toContain(OTHER_ROUTE_PARAM);
  expect(serializedCalls).not.toContain(ORGNUMMER);
  expect(serializedCalls).not.toContain(FNR);
  expect(serializedCalls).not.toContain("sensitive-backend-message");
}

function spyOnLogger(
  method: "warn" | "error",
): MockInstance<(...args: unknown[]) => void> {
  return vi.spyOn(logger, method).mockImplementation(() => undefined);
}
