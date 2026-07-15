import { logger } from "@navikt/next-logger";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../../../graphql/resolvers/resolverTypes";
import type {
  PaaminnelseFeilResponse,
  PaaminnelseStatus,
} from "../../../../services/paaminnelse/paaminnelseContract";
import { PaaminnelseAdapterError } from "../../../../services/paaminnelse/paaminnelseService";
import { DELETE, GET, POST } from "./route";

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

vi.mock("../../../../utils/env", () => ({
  isPaaminnelseFeatureToggleEnabled: () =>
    envState.isPaaminnelseFeatureToggleEnabled,
}));

vi.mock("../../../../auth/withAuthenticatedAppRoute", () => ({
  createAppRouterResolverContextType: createResolverContextTypeMock,
  withAuthenticatedAppRoute: vi.fn((handler) => handler),
}));

vi.mock("../../../../services/paaminnelse/paaminnelseService", async () => {
  const actual = (await vi.importActual(
    "../../../../services/paaminnelse/paaminnelseService",
  )) satisfies typeof import("../../../../services/paaminnelse/paaminnelseService");

  return {
    ...actual,
    hentPaaminnelseStatus: hentPaaminnelseStatusMock,
    bestillPaaminnelse: bestillPaaminnelseMock,
    avbestillPaaminnelse: avbestillPaaminnelseMock,
  };
});

const ROUTE_PARAM = "narmesteleder-1";
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

describe("paaminnelse route", () => {
  it("svarer 401 når autentisert kontekst mangler", async () => {
    const errorSpy = spyOnLogger("error");
    createResolverContextTypeMock.mockReturnValue(null);

    const response = await GET(createRequest(), createRouteContext());
    const body = (await response.json()) as PaaminnelseFeilResponse;

    expect(response.status).toBe(401);
    expect(body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(body);
    expect(errorSpy).toHaveBeenCalledWith(
      "Missing authenticated context in paaminnelse route",
    );
    expectNoBackendCalls();
  });

  it("svarer 400 og dropper backend-kall når parameteren er ugyldig", async () => {
    const warnSpy = spyOnLogger("warn");

    const response = await GET(createRequest(), createRouteContext(""));
    const body = (await response.json()) as PaaminnelseFeilResponse;

    expect(response.status).toBe(400);
    expect(body).toEqual({ feilkode: "UGYLDIG_FORESPORSEL" });
    expectSerializedWithoutPii(body);
    expect(warnSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(warnSpy.mock.calls);
    expectNoBackendCalls();
  });

  it("GET returnerer SKJULT og dropper backend-kall når feature-toggle er av", async () => {
    const response = await GET(createRequest(), createRouteContext());
    const body = (await response.json()) as PaaminnelseStatus;

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "SKJULT", synligFra: null });
    expectSerializedWithoutPii(body);
    expectNoBackendCalls();
  });

  it.each([
    "POST",
    "DELETE",
  ] as const)("%s returnerer 403 og dropper backend-kall når feature-toggle er av", async (method) => {
    const handler = method === "POST" ? POST : DELETE;
    const response = await handler(
      createRequest({
        method,
        body: method === "POST" ? {} : undefined,
      }),
      createRouteContext(),
    );
    const body = (await response.json()) as PaaminnelseFeilResponse;

    expect(response.status).toBe(403);
    expect(body).toEqual({ feilkode: "IKKE_AUTORISERT" });
    expectSerializedWithoutPii(body);
    expectNoBackendCalls();
  });

  it("GET henter status for narmestelederId", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const paaminnelseStatus: PaaminnelseStatus = {
      status: "BESTILT",
      synligFra: null,
    };
    hentPaaminnelseStatusMock.mockResolvedValue(paaminnelseStatus);

    const response = await GET(createRequest(), createRouteContext());
    const body = (await response.json()) as PaaminnelseStatus;

    expect(response.status).toBe(200);
    expect(body).toEqual(paaminnelseStatus);
    expectSerializedWithoutPii(body);
    expect(hentPaaminnelseStatusMock).toHaveBeenCalledWith(
      ROUTE_PARAM,
      resolverContextType,
    );
  });

  it("POST avviser uventede felt i request body", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;

    const response = await POST(
      createRequest({
        method: "POST",
        body: { dagerForFrist: 7 },
      }),
      createRouteContext(),
    );
    const body = (await response.json()) as PaaminnelseFeilResponse;

    expect(response.status).toBe(400);
    expect(body).toEqual({ feilkode: "UGYLDIG_FORESPORSEL" });
    expectSerializedWithoutPii(body);
    expectNoBackendCalls();
  });

  it("POST bestiller påminnelse", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const bestillResponse: PaaminnelseStatus = {
      status: "BESTILT",
      synligFra: null,
    };
    bestillPaaminnelseMock.mockResolvedValue(bestillResponse);

    const response = await POST(
      createRequest({ method: "POST", body: {} }),
      createRouteContext(),
    );
    const body = (await response.json()) as PaaminnelseStatus;

    expect(response.status).toBe(200);
    expect(body).toEqual(bestillResponse);
    expectSerializedWithoutPii(body);
    expect(bestillPaaminnelseMock).toHaveBeenCalledWith(
      ROUTE_PARAM,
      resolverContextType,
    );
  });

  it("DELETE avbestiller påminnelse", async () => {
    envState.isPaaminnelseFeatureToggleEnabled = true;

    const response = await DELETE(
      createRequest({ method: "DELETE" }),
      createRouteContext(),
    );
    const body = (await response.json()) as PaaminnelseStatus;

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "TILGJENGELIG", synligFra: null });
    expectSerializedWithoutPii(body);
    expect(avbestillPaaminnelseMock).toHaveBeenCalledWith(
      ROUTE_PARAM,
      resolverContextType,
    );
  });

  it.each([
    {
      method: "POST",
      handler: POST,
      feilkode: "BESTILLING_FEILET",
      adapterMock: bestillPaaminnelseMock,
    },
    {
      method: "DELETE",
      handler: DELETE,
      feilkode: "AVBESTILLING_FEILET",
      adapterMock: avbestillPaaminnelseMock,
    },
  ] as const)("$method svarer 502 med adapterens feilkode", async ({
    handler,
    method,
    feilkode,
    adapterMock,
  }) => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    adapterMock.mockRejectedValue(new PaaminnelseAdapterError(feilkode));

    const response = await handler(
      createRequest({
        method,
        body: method === "POST" ? {} : undefined,
      }),
      createRouteContext(),
    );
    const body = (await response.json()) as PaaminnelseFeilResponse;

    expect(response.status).toBe(502);
    expect(body).toEqual({ feilkode });
    expectSerializedWithoutPii(body);
  });

  it.each([
    {
      method: "GET",
      handler: GET,
      request: createRequest(),
      backendMock: hentPaaminnelseStatusMock,
      feilkode: "STATUS_FEILET",
    },
    {
      method: "POST",
      handler: POST,
      request: createRequest({ method: "POST", body: {} }),
      backendMock: bestillPaaminnelseMock,
      feilkode: "BESTILLING_FEILET",
    },
    {
      method: "DELETE",
      handler: DELETE,
      request: createRequest({ method: "DELETE" }),
      backendMock: avbestillPaaminnelseMock,
      feilkode: "AVBESTILLING_FEILET",
    },
  ] as const)("$method logger uten PII og returnerer metode-spesifikk feilkode ved uventet feil", async ({
    handler,
    request,
    backendMock,
    feilkode,
  }) => {
    envState.isPaaminnelseFeatureToggleEnabled = true;
    const errorSpy = spyOnLogger("error");
    backendMock.mockRejectedValue(
      new Error(
        `sensitive-backend-message for ${ORGNUMMER}, ${FNR} og ${ROUTE_PARAM}`,
      ),
    );

    const response = await handler(request, createRouteContext());
    const body = (await response.json()) as PaaminnelseFeilResponse;

    expect(response.status).toBe(502);
    expect(body).toEqual({ feilkode });
    expectSerializedWithoutPii(body);
    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });
});

function createRequest({
  method = "GET",
  narmestelederId = ROUTE_PARAM,
  body,
}: {
  method?: "GET" | "POST" | "DELETE";
  narmestelederId?: string;
  body?: unknown;
} = {}): Request {
  const headers = new Headers({
    "x-request-id": REQUEST_ID,
  });

  let requestBody: string | undefined;
  if (body !== undefined) {
    headers.set("content-type", "application/json");
    requestBody = JSON.stringify(body);
  }

  return new Request(
    `https://example.com/api/paaminnelse/${encodeURIComponent(narmestelederId)}`,
    {
      method,
      headers,
      body: requestBody,
    },
  );
}

function createRouteContext(
  narmestelederId = ROUTE_PARAM,
): RouteContext<"/api/paaminnelse/[narmestelederId]"> {
  return {
    params: Promise.resolve({ narmestelederId }),
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
  expect(serializedCalls).not.toContain(ORGNUMMER);
  expect(serializedCalls).not.toContain(FNR);
  expect(serializedCalls).not.toContain("sensitive-backend-message");
}

function spyOnLogger(
  method: "warn" | "error",
): MockInstance<(...args: unknown[]) => void> {
  return vi.spyOn(logger, method).mockImplementation(() => undefined);
}
