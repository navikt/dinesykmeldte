import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import {
  RuntimeErrorCode,
  RuntimeErrorEvent,
  RuntimeErrorOperation,
} from "../../../observability/runtimeErrorContract";
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

const lines = vi.hoisted((): string[] => []);
vi.mock("@navikt/next-logger", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@navikt/next-logger")>();
  return {
    ...actual,
    logger: actual.backendLogger(
      {},
      { write: (line: string) => lines.push(line) },
    ),
  };
});

vi.mock("../../../auth/withAuthenticatedApiRoute", () => ({
  createAppRouterResolverContextType: createResolverContextTypeMock,
  withAuthenticatedApiRoute: vi.fn((handler) => handler),
}));

vi.mock("../../../services/tiltakspakke/tiltakspakkevurderingService", () => ({
  getTiltakspakkevurderinger: getTiltakspakkevurderingerMock,
}));

const ORGNUMMER = "999888777";
const FNR = "00000000000";
const NAVN = "Test Testesen";
const NARMESTELEDER_ID = "narmesteleder-1";
const REQUEST_ID = "mock-request-id";
const RUNTIME_ERROR_MESSAGE =
  "Kunne ikke hente tiltakspakkevurdering; returnerer tom liste";

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
  lines.length = 0;
  createResolverContextTypeMock.mockReturnValue(resolverContextType);
  getTiltakspakkevurderingerMock.mockResolvedValue(createEmptyVurderinger());
});

describe("tiltakspakkevurdering-API-et", () => {
  it("svarer 401 når autentisert kontekst mangler", async () => {
    createResolverContextTypeMock.mockReturnValue(null);
    const request = createFakeReq();
    const response = await handler(request, undefined);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expectResponseWithoutPii(body);
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject({
      level: "warn",
      event_type: "authenticated_context_missing",
      failure_kind: "token",
      failure_stage: "authentication",
      outcome: "rejected",
    });
    expect(lines[0]).not.toMatch(/mock-request-id|logging_context_invalid/);
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
      { demoScenario: "default" },
    );
  });

  it("videresender demoScenario='default' når demo-cookien mangler", async () => {
    const request = createFakeReq();
    await handler(request, undefined);

    expect(getTiltakspakkevurderingerMock).toHaveBeenCalledWith(
      resolverContextType,
      { demoScenario: "default" },
    );
  });

  it("videresender demoScenario='tiltakspakke-1' når demo-cookien er eksplisitt satt til det", async () => {
    const request = createFakeReq({
      cookie: "demo-scenario=tiltakspakke-1",
    });
    await handler(request, undefined);

    expect(getTiltakspakkevurderingerMock).toHaveBeenCalledWith(
      resolverContextType,
      { demoScenario: "tiltakspakke-1" },
    );
  });

  it("videresender demoScenario='default' for en ukjent cookieverdi", async () => {
    const request = createFakeReq({
      cookie: "demo-scenario=nope",
    });
    await handler(request, undefined);

    expect(getTiltakspakkevurderingerMock).toHaveBeenCalledWith(
      resolverContextType,
      { demoScenario: "default" },
    );
  });

  it("ignorerer en cookie som kun inneholder cookienavnet vårt som substreng", async () => {
    const request = createFakeReq({
      cookie: "other-demo-scenario-x=tiltakspakke-1",
    });
    await handler(request, undefined);

    expect(getTiltakspakkevurderingerMock).toHaveBeenCalledWith(
      resolverContextType,
      { demoScenario: "default" },
    );
  });

  it("feiler trygt til tom vurderinger-array og logger uten PII når servicen kaster", async () => {
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
    expectRouteFailureLog({ failure_kind: "unknown" });
  });

  it("beholder RuntimeErrorCode og avgrenset cause_code for en transportfeil", async () => {
    getTiltakspakkevurderingerMock.mockRejectedValue(
      Object.assign(new Error(`secret ${ORGNUMMER} ${FNR}`), {
        code: "ENOTFOUND",
      }),
    );
    const response = await handler(createFakeReq(), undefined);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expectRouteFailureLog({
      cause_code: "ENOTFOUND",
      failure_kind: "dns",
    });
  });
});

function expectRouteFailureLog(diagnostics: Record<string, unknown>): void {
  expect(lines).toHaveLength(1);
  const record = JSON.parse(lines[0]);
  expect(record).toMatchObject({
    level: "error",
    event_type: RuntimeErrorEvent.TILTAKSPAKKEVURDERING_LOOKUP_FAILED,
    operation: RuntimeErrorOperation.TILTAKSPAKKEVURDERING_LOOKUP,
    error_code: RuntimeErrorCode.UNEXPECTED_ERROR,
    message: RUNTIME_ERROR_MESSAGE,
    outcome: "degraded",
    ...diagnostics,
  });
  for (const field of [
    "lookup_code",
    "xRequestId",
    "url",
    "body",
    "err",
    "error",
    "stack",
  ]) {
    expect(record).not.toHaveProperty(field);
  }
  expect(lines[0]).not.toMatch(
    /999888777|00000000000|Test Testesen|narmesteleder-1|mock-request-id|mock-access-token|logging_context_invalid/,
  );
}

function createFakeReq({
  method = "GET",
  cookie,
}: {
  method?: string;
  cookie?: string;
} = {}): Request {
  const headers: Record<string, string> = { "x-request-id": REQUEST_ID };
  if (cookie !== undefined) {
    headers.cookie = cookie;
  }

  return new Request("https://example.com/api/tiltakspakkevurdering", {
    method,
    headers,
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
