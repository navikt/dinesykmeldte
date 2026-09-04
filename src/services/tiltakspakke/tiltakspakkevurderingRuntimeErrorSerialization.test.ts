import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import {
  RuntimeErrorCode,
  RuntimeErrorEvent,
  RuntimeErrorOperation,
} from "../../observability/runtimeErrorContract";
import { getTiltakspakkevurderinger } from "./tiltakspakkevurderingService";

const serializedLogLines = vi.hoisted((): string[] => []);
const { getMineSykmeldteMock, fetchTiltakspakkevurderingerMock } = vi.hoisted(
  () => ({
    getMineSykmeldteMock: vi.fn(),
    fetchTiltakspakkevurderingerMock: vi.fn(),
  }),
);

vi.mock("@navikt/next-logger", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@navikt/next-logger")>();

  return {
    ...actual,
    logger: actual.backendLogger(
      {},
      {
        write(line: string) {
          serializedLogLines.push(line);
        },
      },
    ),
  };
});

vi.mock("../minesykmeldte/mineSykmeldteService", () => ({
  getMineSykmeldte: getMineSykmeldteMock,
}));

vi.mock("../flaggskipet/flaggskipetClient", () => ({
  fetchTiltakspakkevurderinger: fetchTiltakspakkevurderingerMock,
}));

vi.mock("../../utils/env", () => ({
  isLocalOrDemo: false,
  isTiltakspakkevurderingFeatureToggleEnabled: () => true,
}));

vi.mock("../../graphql/resolvers/mockresolvers/mockDb", () => ({
  default: () => ({ sykmeldte: [] }),
}));

const FNR = "12345678901";
const ORGNUMMER = "999888777";
const UUID = "00000000-0000-0000-0000-000000000000";
const EMAIL = "alice@example.test";
const URL = "https://example.test/person/42?token=secret-canary";
const ACCESS_TOKEN = "access-token-canary";
const REQUEST_ID = "request-id-canary";
const ERROR_DETAIL = `failure for ${FNR}, ${ORGNUMMER}, ${UUID}, ${EMAIL} at ${URL}`;
const RUNTIME_ERROR_MESSAGE =
  "Kunne ikke hente tiltakspakkevurdering; returnerer tom liste";

const resolverContext: ResolverContextType = {
  pid: FNR,
  accessToken: ACCESS_TOKEN,
  xRequestId: REQUEST_ID,
};

beforeEach(() => {
  vi.clearAllMocks();
  serializedLogLines.length = 0;
  getMineSykmeldteMock.mockResolvedValue([]);
  fetchTiltakspakkevurderingerMock.mockResolvedValue([]);
});

describe("serialized tiltakspakkevurdering runtime error", () => {
  it("emits one canonical Pino JSON log when authorized orgnummer lookup fails", async () => {
    getMineSykmeldteMock.mockRejectedValue(new Error(ERROR_DETAIL));

    await expect(getTiltakspakkevurderinger(resolverContext)).resolves.toEqual(
      [],
    );

    expectCanonicalLog(RuntimeErrorCode.AUTORISERTE_ORGNUMRE_LOOKUP_FAILED);
    expect(fetchTiltakspakkevurderingerMock).not.toHaveBeenCalled();
  });

  it("emits one canonical Pino JSON log when Flaggskipet lookup fails", async () => {
    getMineSykmeldteMock.mockResolvedValue([{ orgnummer: ORGNUMMER }]);
    fetchTiltakspakkevurderingerMock.mockRejectedValue(new Error(ERROR_DETAIL));

    await expect(getTiltakspakkevurderinger(resolverContext)).resolves.toEqual(
      [],
    );

    expectCanonicalLog(RuntimeErrorCode.FLAGGSKIPET_LOOKUP_FAILED);
  });
});

function expectCanonicalLog(errorCode: string): void {
  expect(serializedLogLines).toHaveLength(1);

  const serializedLog = serializedLogLines[0];
  const parsedLog = JSON.parse(serializedLog) as Record<string, unknown>;

  expect(parsedLog).toMatchObject({
    level: "error",
    event_type: RuntimeErrorEvent.TILTAKSPAKKEVURDERING_LOOKUP_FAILED,
    operation: RuntimeErrorOperation.TILTAKSPAKKEVURDERING_LOOKUP,
    error_code: errorCode,
    message: RUNTIME_ERROR_MESSAGE,
  });
  expect(parsedLog).not.toHaveProperty("upstream_status");
  expect(parsedLog).not.toHaveProperty("xRequestId");
  expect(parsedLog).not.toHaveProperty("endpoint");
  expect(parsedLog).not.toHaveProperty("url");
  expect(parsedLog).not.toHaveProperty("body");
  expect(parsedLog).not.toHaveProperty("err");
  expect(parsedLog).not.toHaveProperty("error");
  expect(parsedLog).not.toHaveProperty("stack");

  for (const canary of [
    FNR,
    ORGNUMMER,
    UUID,
    EMAIL,
    URL,
    ACCESS_TOKEN,
    REQUEST_ID,
    ERROR_DETAIL,
  ]) {
    expect(serializedLog).not.toContain(canary);
  }
}
