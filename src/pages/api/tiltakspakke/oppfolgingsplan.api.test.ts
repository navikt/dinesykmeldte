import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Mock, MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type OppfolgingsplanTiltakspakkeGateMap,
} from "../../../services/tiltakspakke/oppfolgingsplanTiltakspakkeContract";

const {
  createResolverContextTypeMock,
  getOppfolgingsplanTiltakspakkeGateMapMock,
} = vi.hoisted(() => ({
  createResolverContextTypeMock: vi.fn(),
  getOppfolgingsplanTiltakspakkeGateMapMock: vi.fn(),
}));

vi.mock("../../../auth/withAuthentication", () => ({
  createResolverContextType: createResolverContextTypeMock,
  withAuthenticatedApi: vi.fn((handler) => handler),
}));

vi.mock(
  "../../../services/tiltakspakke/oppfolgingsplanTiltakspakkeService",
  () => ({
    getOppfolgingsplanTiltakspakkeGateMap:
      getOppfolgingsplanTiltakspakkeGateMapMock,
  }),
);

import handler from "./oppfolgingsplan.api";

const ORGNUMMER = "999888777";
const FNR = "00000000000";
const NAVN = "Test Testesen";
const NARMESTELEDER_ID = "narmesteleder-1";
const REQUEST_ID = "mock-request-id";

const resolverContextType: ResolverContextType = {
  pid: FNR,
  accessToken: "mock-access-token",
  xRequestId: REQUEST_ID,
};

function createEmptyGateMap(): OppfolgingsplanTiltakspakkeGateMap {
  return {
    gates: [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  createResolverContextTypeMock.mockReturnValue(resolverContextType);
  getOppfolgingsplanTiltakspakkeGateMapMock.mockResolvedValue(
    createEmptyGateMap(),
  );
});

describe("tiltakspakke-API-et", () => {
  it("svarer 405 med Allow-header for metoder som ikke støttes", async () => {
    const request = createFakeReq({ method: "POST" });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.mockSetHeader).toHaveBeenCalledWith("Allow", "GET");
    expect(response.statusCode).toBe(405);
    expect(response.body).toEqual({ error: "Method not allowed" });
    expectResponseWithoutPii(response.body);
    expect(createResolverContextTypeMock).not.toHaveBeenCalled();
    expect(getOppfolgingsplanTiltakspakkeGateMapMock).not.toHaveBeenCalled();
  });

  it("svarer 401 når autentisert kontekst mangler", async () => {
    const errorSpy = spyOnLogger("error");
    createResolverContextTypeMock.mockReturnValue(null);
    const request = createFakeReq();
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
    expectResponseWithoutPii(response.body);
    expect(errorSpy).toHaveBeenCalledWith(
      "Missing authenticated context in tiltakspakke API",
    );
    expect(getOppfolgingsplanTiltakspakkeGateMapMock).not.toHaveBeenCalled();
  });

  it("returnerer gate-mapen fra tiltakspakke-servicen", async () => {
    const request = createFakeReq();
    const response = createFakeRes();
    const gateMap: OppfolgingsplanTiltakspakkeGateMap = {
      gates: [
        {
          orgnummer: ORGNUMMER,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    };
    getOppfolgingsplanTiltakspakkeGateMapMock.mockResolvedValue(gateMap);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(gateMap);
    expectResponseWithoutPii(response.body);
    expect(getOppfolgingsplanTiltakspakkeGateMapMock).toHaveBeenCalledWith(
      resolverContextType,
    );
  });

  it("feiler trygt til tom gate-map og logger uten PII når servicen kaster", async () => {
    const errorSpy = spyOnLogger("error");
    const request = createFakeReq();
    const response = createFakeRes();
    getOppfolgingsplanTiltakspakkeGateMapMock.mockRejectedValue(
      new Error(
        `failed for ${ORGNUMMER}, ${FNR}, ${NAVN}, ${NARMESTELEDER_ID}`,
      ),
    );

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(createEmptyGateMap());
    expectResponseWithoutPii(response.body);
    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });
});

function createFakeReq({
  method = "GET",
}: {
  method?: string;
} = {}): NextApiRequest {
  return {
    method,
    query: {},
    headers: {},
  } as unknown as NextApiRequest;
}

function createFakeRes(): {
  res: NextApiResponse<OppfolgingsplanTiltakspakkeGateMap | { error: string }>;
  body: OppfolgingsplanTiltakspakkeGateMap | { error: string } | null;
  statusCode: number | null;
  mockSetHeader: Mock;
} {
  let body: OppfolgingsplanTiltakspakkeGateMap | { error: string } | null =
    null;
  let statusCode: number | null = null;
  const mockSetHeader = vi.fn();
  const response = {
    json: vi.fn(
      (jsonBody: OppfolgingsplanTiltakspakkeGateMap | { error: string }) => {
        body = jsonBody;
        return response;
      },
    ),
    status: vi.fn((nextStatusCode: number) => {
      statusCode = nextStatusCode;
      return response;
    }),
    setHeader: mockSetHeader,
  } as unknown as NextApiResponse<
    OppfolgingsplanTiltakspakkeGateMap | { error: string }
  >;

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

function expectResponseWithoutPii(
  value: OppfolgingsplanTiltakspakkeGateMap | { error: string } | null,
): void {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain(FNR);
  expect(serialized).not.toContain(NAVN);
  expect(serialized).not.toContain(NARMESTELEDER_ID);
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
  expect(serializedCalls).not.toContain(NAVN);
  expect(serializedCalls).not.toContain(NARMESTELEDER_ID);
}

function spyOnLogger(
  method: "error",
): MockInstance<(...args: unknown[]) => void> {
  return vi.spyOn(logger, method).mockImplementation(() => undefined);
}
