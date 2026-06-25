import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Mock, MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type TiltakspakkevurderingMap,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";

const { createResolverContextTypeMock, getTiltakspakkevurderingMapMock } =
  vi.hoisted(() => ({
    createResolverContextTypeMock: vi.fn(),
    getTiltakspakkevurderingMapMock: vi.fn(),
  }));

vi.mock("../../auth/withAuthentication", () => ({
  createResolverContextType: createResolverContextTypeMock,
  withAuthenticatedApi: vi.fn((handler) => handler),
}));

vi.mock("../../services/tiltakspakke/tiltakspakkevurderingService", () => ({
  getTiltakspakkevurderingMap: getTiltakspakkevurderingMapMock,
}));

import handler from "./tiltakspakkevurdering.api";

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

function createEmptyVurderingMap(): TiltakspakkevurderingMap {
  return {
    vurderinger: [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  createResolverContextTypeMock.mockReturnValue(resolverContextType);
  getTiltakspakkevurderingMapMock.mockResolvedValue(createEmptyVurderingMap());
});

describe("tiltakspakkevurdering-API-et", () => {
  it("svarer 405 med Allow-header for metoder som ikke støttes", async () => {
    const request = createFakeReq({ method: "POST" });
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.mockSetHeader).toHaveBeenCalledWith("Allow", "GET");
    expect(response.mockSetHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "no-store",
    );
    expect(response.statusCode).toBe(405);
    expect(response.body).toEqual({ error: "Method not allowed" });
    expectResponseWithoutPii(response.body);
    expect(createResolverContextTypeMock).not.toHaveBeenCalled();
    expect(getTiltakspakkevurderingMapMock).not.toHaveBeenCalled();
  });

  it("svarer 401 når autentisert kontekst mangler", async () => {
    const errorSpy = spyOnLogger("error");
    createResolverContextTypeMock.mockReturnValue(null);
    const request = createFakeReq();
    const response = createFakeRes();

    await handler(request, response.res);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
    expect(response.mockSetHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "no-store",
    );
    expectResponseWithoutPii(response.body);
    expect(errorSpy).toHaveBeenCalledWith(
      "Missing authenticated context in tiltakspakkevurdering API",
    );
    expect(getTiltakspakkevurderingMapMock).not.toHaveBeenCalled();
  });

  it("returnerer vurdering-mapen fra tiltakspakkevurdering-servicen", async () => {
    const request = createFakeReq();
    const response = createFakeRes();
    const vurderingMap: TiltakspakkevurderingMap = {
      vurderinger: [
        {
          orgnummer: ORGNUMMER,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    };
    getTiltakspakkevurderingMapMock.mockResolvedValue(vurderingMap);

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(vurderingMap);
    expect(response.mockSetHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "no-store",
    );
    expectResponseWithoutPii(response.body);
    expect(getTiltakspakkevurderingMapMock).toHaveBeenCalledWith(
      resolverContextType,
    );
  });

  it("feiler trygt til tom vurdering-map og logger uten PII når servicen kaster", async () => {
    const errorSpy = spyOnLogger("error");
    const request = createFakeReq();
    const response = createFakeRes();
    getTiltakspakkevurderingMapMock.mockRejectedValue(
      new Error(
        `failed for ${ORGNUMMER}, ${FNR}, ${NAVN}, ${NARMESTELEDER_ID}`,
      ),
    );

    await handler(request, response.res);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(createEmptyVurderingMap());
    expect(response.mockSetHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "no-store",
    );
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
  res: NextApiResponse<TiltakspakkevurderingMap | { error: string }>;
  body: TiltakspakkevurderingMap | { error: string } | null;
  statusCode: number | null;
  mockSetHeader: Mock;
} {
  let body: TiltakspakkevurderingMap | { error: string } | null = null;
  let statusCode: number | null = null;
  const mockSetHeader = vi.fn();
  const response = {
    json: vi.fn((jsonBody: TiltakspakkevurderingMap | { error: string }) => {
      body = jsonBody;
      return response;
    }),
    status: vi.fn((nextStatusCode: number) => {
      statusCode = nextStatusCode;
      return response;
    }),
    setHeader: mockSetHeader,
  } as unknown as NextApiResponse<TiltakspakkevurderingMap | { error: string }>;

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
  value: TiltakspakkevurderingMap | { error: string } | null,
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
