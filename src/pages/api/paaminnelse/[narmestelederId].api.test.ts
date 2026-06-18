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
  envState,
  createResolverContextTypeMock,
  getMineSykmeldteMock,
  hentPaaminnelseStatusMock,
  bestillPaaminnelseMock,
  avbestillPaaminnelseMock,
} = vi.hoisted(() => ({
  envState: {
    isPaaminnelseFeatureToggleEnabled: false,
  },
  createResolverContextTypeMock: vi.fn(),
  getMineSykmeldteMock: vi.fn(),
  hentPaaminnelseStatusMock: vi.fn(),
  bestillPaaminnelseMock: vi.fn(),
  avbestillPaaminnelseMock: vi.fn(),
}));

vi.mock("../../../utils/env", () => ({
  isPaaminnelseFeatureToggleEnabled: () =>
    envState.isPaaminnelseFeatureToggleEnabled,
}));

vi.mock("../../../auth/withAuthentication", () => ({
  createResolverContextType: createResolverContextTypeMock,
  withAuthenticatedApi: vi.fn((handler) => handler),
}));

vi.mock("../../../services/minesykmeldte/mineSykmeldteService", () => ({
  getMineSykmeldte: getMineSykmeldteMock,
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
  envState.isPaaminnelseFeatureToggleEnabled = false;
  createResolverContextTypeMock.mockReturnValue(resolverContextType);
  getMineSykmeldteMock.mockResolvedValue([authorizedSykmeldt]);
  hentPaaminnelseStatusMock.mockResolvedValue({ status: "BESTILT" });
  bestillPaaminnelseMock.mockResolvedValue({ status: "BESTILT" });
  avbestillPaaminnelseMock.mockResolvedValue({ status: "TILGJENGELIG" });
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
    expect(createResolverContextTypeMock).not.toHaveBeenCalled();
    expectNoBackendCalls();
  });

  it("returns 401 when resolver context is missing", async () => {
    createResolverContextTypeMock.mockReturnValue(null);
    const request = createFakeReq();
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(response.body);
    expectNoBackendCalls();
  });

  it("returns 400 and skips backend calls when route param is invalid", async () => {
    const warnSpy = spyOnLogger("warn");
    const request = createFakeReq({
      narmestelederId: [ROUTE_PARAM, OTHER_ROUTE_PARAM],
    });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ feilkode: "UGYLDIG_FORESPORSEL" });
    expectSerializedWithoutPii(response.body);
    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
    expectNoBackendCalls();
  });

  it("returns SKJULT and skips backend calls when feature toggle is off", async () => {
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "SKJULT" });
    expectSerializedWithoutPii(response.body);
    expectNoBackendCalls();
  });

  it.each([
    "POST",
    "DELETE",
  ] as const)("%s returns 403 and skips backend calls when feature toggle is off", async (method) => {
    const request = createFakeReq({
      method,
      body: method === "POST" ? {} : undefined,
    });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(response.body);
    expectNoBackendCalls();
  });

  it("returns 403 when route param is not authorized", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
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

  it("GET fetches status for an authorized narmestelederId", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();
    const paaminnelseStatus: PaaminnelseStatus = { status: "BESTILT" };
    hentPaaminnelseStatusMock.mockResolvedValue(paaminnelseStatus);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(paaminnelseStatus);
    expectSerializedWithoutPii(response.body);
    expect(getMineSykmeldteMock).toHaveBeenCalledWith(resolverContextType);
    expect(hentPaaminnelseStatusMock).toHaveBeenCalledWith(
      ROUTE_PARAM,
      resolverContextType,
    );
  });

  it("POST rejects unexpected request body fields", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({
      method: "POST",
      body: { dagerForFrist: 7 },
    });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ feilkode: "UGYLDIG_FORESPORSEL" });
    expectSerializedWithoutPii(response.body);
    expectNoBackendCalls();
  });

  it("POST bestiller paaminnelse for an authorized narmestelederId", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({ method: "POST", body: {} });
    const response = createFakeRes();
    const bestillResponse: PaaminnelseStatus = { status: "BESTILT" };
    bestillPaaminnelseMock.mockResolvedValue(bestillResponse);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(bestillResponse);
    expectSerializedWithoutPii(response.body);
    expect(bestillPaaminnelseMock).toHaveBeenCalledWith(
      ROUTE_PARAM,
      resolverContextType,
    );
  });

  it("DELETE avbestiller paaminnelse for an authorized narmestelederId", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({ method: "DELETE" });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "TILGJENGELIG" });
    expectSerializedWithoutPii(response.body);
    expect(avbestillPaaminnelseMock).toHaveBeenCalledWith(
      ROUTE_PARAM,
      resolverContextType,
    );
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
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({ method });
    const response = createFakeRes();
    adapterMock.mockRejectedValue(new PaaminnelseAdapterError(feilkode));

    await handler(request, response.res);

    expect(response.statusCode).toBe(502);
    expect(response.body).toEqual({ feilkode });
    expectSerializedWithoutPii(response.body);
  });

  it("returns a sanitized fixed-code error when an upstream dependency throws", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
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

function expectNoBackendCalls(): void {
  expect(getMineSykmeldteMock).not.toHaveBeenCalled();
  expectNoAdapterCalls();
}

function expectNoAdapterCalls(): void {
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
