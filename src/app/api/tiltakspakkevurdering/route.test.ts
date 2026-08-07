import { logger } from "@navikt/next-logger";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import {
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type Tiltakspakkevurderinger,
} from "../../../services/tiltakspakke/tiltakspakkevurderingContract";
import { GET as handler } from "./route";

const { createResolverContextTypeMock, getTiltakspakkevurderingerMock } =
  vi.hoisted(() => ({
    createResolverContextTypeMock: vi.fn(),
    getTiltakspakkevurderingerMock: vi.fn(),
  }));

vi.mock("../../../auth/withAuthenticatedAppRoute", () => ({
  createAppRouterResolverContextType: createResolverContextTypeMock,
  withAuthenticatedAppRoute: vi.fn((handler) => handler),
}));

vi.mock("../../../services/tiltakspakke/tiltakspakkevurderingService", () => ({
  getTiltakspakkevurderinger: getTiltakspakkevurderingerMock,
}));

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

function createEmptyVurderinger(): Tiltakspakkevurderinger {
  return [];
}

beforeEach(() => {
  vi.clearAllMocks();
  createResolverContextTypeMock.mockReturnValue(resolverContextType);
  getTiltakspakkevurderingerMock.mockResolvedValue(createEmptyVurderinger());
});

describe("tiltakspakkevurdering-API-et", () => {
  it("svarer 401 når autentisert kontekst mangler", async () => {
    const errorSpy = spyOnLogger("error");
    createResolverContextTypeMock.mockReturnValue(null);
    const request = createFakeReq();
    const response = await handler(request, undefined);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expectResponseWithoutPii(body);
    expect(errorSpy).toHaveBeenCalledWith(
      "Missing authenticated context in tiltakspakkevurdering route",
    );
    expect(getTiltakspakkevurderingerMock).not.toHaveBeenCalled();
  });

  it("returnerer vurderingene fra tiltakspakkevurdering-servicen", async () => {
    const request = createFakeReq();
    const vurderinger: Tiltakspakkevurderinger = [
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [{ orgnummer: ORGNUMMER, deltakelse: "TILTAKSGRUPPE" }],
      },
    ];
    getTiltakspakkevurderingerMock.mockResolvedValue(vurderinger);
    const response = await handler(request, undefined);
    const body = (await response.json()) as Tiltakspakkevurderinger;

    expect(response.status).toBe(200);
    expect(body).toEqual(vurderinger);
    expectResponseWithoutPii(body);
    expect(getTiltakspakkevurderingerMock).toHaveBeenCalledWith(
      resolverContextType,
    );
  });

  it("feiler trygt til tom vurderinger-array og logger uten PII når servicen kaster", async () => {
    const errorSpy = spyOnLogger("error");
    const request = createFakeReq();
    getTiltakspakkevurderingerMock.mockRejectedValue(
      new Error(
        `failed for ${ORGNUMMER}, ${FNR}, ${NAVN}, ${NARMESTELEDER_ID}`,
      ),
    );
    const response = await handler(request, undefined);
    const body = (await response.json()) as Tiltakspakkevurderinger;

    expect(response.status).toBe(200);
    expect(body).toEqual(createEmptyVurderinger());
    expectResponseWithoutPii(body);
    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });
});

function createFakeReq({ method = "GET" }: { method?: string } = {}): Request {
  return new Request("https://example.com/api/tiltakspakkevurdering", {
    method,
    headers: { "x-request-id": REQUEST_ID },
  });
}

function expectResponseWithoutPii(
  value: Tiltakspakkevurderinger | { error: string } | null,
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
