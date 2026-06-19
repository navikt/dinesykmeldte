import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Mock, MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import type {
  PaaminnelseFeilResponse,
  PaaminnelseStatus,
} from "../../../services/paaminnelse/paaminnelseContract";
import { PaaminnelseAdapterError } from "../../../services/paaminnelse/paaminnelseService";

const {
  envState,
  createResolverContextTypeMock,
  hentPaaminnelseStatusMock,
  bestillPaaminnelseMock,
  avbestillPaaminnelseMock,
} = vi.hoisted(() => ({
  envState: {
    isPaaminnelseFeatureToggleEnabled: false,
  },
  createResolverContextTypeMock: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks();
  envState.isPaaminnelseFeatureToggleEnabled = false;
  createResolverContextTypeMock.mockReturnValue(resolverContextType);
  hentPaaminnelseStatusMock.mockResolvedValue({
    status: "BESTILT",
    synligFra: null,
  });
  bestillPaaminnelseMock.mockResolvedValue({
    status: "BESTILT",
    synligFra: null,
  });
  avbestillPaaminnelseMock.mockResolvedValue({
    status: "TILGJENGELIG",
    synligFra: null,
  });
});

describe("påminnelse-API-et", () => {
  it("svarer 405 med Allow-header på metoder som ikke støttes", async () => {
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

  it("svarer 401 når resolver-context mangler", async () => {
    createResolverContextTypeMock.mockReturnValue(null);
    const request = createFakeReq();
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(response.body);
    expectNoBackendCalls();
  });

  it("svarer 400 og dropper backend-kall når parameteren er ugyldig", async () => {
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

  it("svarer SKJULT og dropper backend-kall når feature-toggle er av", async () => {
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "SKJULT", synligFra: null });
    expectSerializedWithoutPii(response.body);
    expectNoBackendCalls();
  });

  it.each([
    "POST",
    "DELETE",
  ] as const)("%s svarer 403 og dropper backend-kall når feature-toggle er av", async (method) => {
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

  it("GET henter status for en narmestelederId", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();
    const paaminnelseStatus: PaaminnelseStatus = {
      status: "BESTILT",
      synligFra: null,
    };
    hentPaaminnelseStatusMock.mockResolvedValue(paaminnelseStatus);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(paaminnelseStatus);
    expectSerializedWithoutPii(response.body);
    expect(hentPaaminnelseStatusMock).toHaveBeenCalledWith(
      ROUTE_PARAM,
      resolverContextType,
    );
  });

  it("POST avviser uventede felt i request-body", async () => {
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

  it("POST bestiller påminnelse for en narmestelederId", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({ method: "POST", body: {} });
    const response = createFakeRes();
    const bestillResponse: PaaminnelseStatus = {
      status: "BESTILT",
      synligFra: null,
    };
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

  it("DELETE avbestiller påminnelse for en narmestelederId", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const request = createFakeReq({ method: "DELETE" });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "TILGJENGELIG", synligFra: null });
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
  ] as const)("$method svarer 502 med fast feilkode når adapteren kaster skrivefeil", async ({
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

  it("svarer 502 med fast feilkode (uten PII) når et underliggende kall kaster", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const errorSpy = spyOnLogger("error");
    const request = createFakeReq({ method: "GET" });
    const response = createFakeRes();
    hentPaaminnelseStatusMock.mockRejectedValue(
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

function expectNoBackendCalls(): void {
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
