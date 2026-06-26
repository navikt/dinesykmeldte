import { logger } from "@navikt/next-logger";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { createPreviewSykmeldt } from "../../utils/test/dataCreators";
import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "./tiltakspakkevurderingContract";
import {
  extractAuthorizedOrgnumre,
  getTiltakspakkevurderingMap,
  mapRawEvaluationsToVurderingMap,
} from "./tiltakspakkevurderingService";

const {
  getMineSykmeldteMock,
  isTiltakspakkevurderingFeatureToggleEnabledMock,
  mockDbSykmeldteMock,
  envState,
} = vi.hoisted(() => ({
  getMineSykmeldteMock: vi.fn(),
  isTiltakspakkevurderingFeatureToggleEnabledMock: vi.fn(),
  mockDbSykmeldteMock: vi.fn(),
  envState: { isLocalOrDemo: false },
}));

vi.mock("../minesykmeldte/mineSykmeldteService", () => ({
  getMineSykmeldte: getMineSykmeldteMock,
}));

vi.mock("../../utils/env", () => ({
  isTiltakspakkevurderingFeatureToggleEnabled:
    isTiltakspakkevurderingFeatureToggleEnabledMock,
  get isLocalOrDemo() {
    return envState.isLocalOrDemo;
  },
}));

vi.mock("../../graphql/resolvers/mockresolvers/mockDb", () => ({
  default: () => ({
    get sykmeldte() {
      return mockDbSykmeldteMock();
    },
  }),
}));

const ORGNUMMER_1 = "999888777";
const ORGNUMMER_2 = "111222333";
const ORGNUMMER_3 = "444555666";
const ORGNUMMER_4 = "777888999";
const UKJENT_ORGNUMMER = "123123123";
const NARMESTELEDER_ID = "narmesteleder-1";
const FNR = "00000000000";
const NAVN = "Test Testesen";
const REQUEST_ID = "mock-request-id";

const resolverContextType: ResolverContextType = {
  pid: FNR,
  accessToken: "mock-access-token",
  xRequestId: REQUEST_ID,
};

beforeEach(() => {
  vi.clearAllMocks();
  isTiltakspakkevurderingFeatureToggleEnabledMock.mockReturnValue(true);
  envState.isLocalOrDemo = false;
  mockDbSykmeldteMock.mockReturnValue([]);
});

describe("tiltakspakkevurderingService", () => {
  it("extractAuthorizedOrgnumre deduplicates authorized orgnummer", () => {
    const authorizedOrgnumre = extractAuthorizedOrgnumre([
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_1,
        fnr: FNR,
        navn: NAVN,
        narmestelederId: NARMESTELEDER_ID,
      }),
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_1,
        fnr: "00000000001",
        navn: "Synthetic Person 1",
        narmestelederId: "narmesteleder-2",
      }),
      createPreviewSykmeldt({
        orgnummer: "",
        fnr: "00000000002",
        navn: "Blank Orgnummer",
        narmestelederId: "narmesteleder-3",
      }),
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_2,
        fnr: "00000000003",
        navn: "Synthetic Person 2",
        narmestelederId: "narmesteleder-4",
      }),
    ]);

    expect(authorizedOrgnumre).toEqual([ORGNUMMER_1, ORGNUMMER_2]);
  });

  it("mapRawEvaluationsToVurderingMap keeps the contracted statuses per authorized orgnummer", () => {
    const vurderingMap = mapRawEvaluationsToVurderingMap(
      [ORGNUMMER_1, ORGNUMMER_2, ORGNUMMER_3],
      [
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_2,
          status: "KONTROLLGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_3,
          status: "UTENFOR_SCOPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    );

    expect(vurderingMap).toEqual({
      vurderinger: [
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_2,
          status: "KONTROLLGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_3,
          status: "UTENFOR_SCOPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
  });

  it("mapRawEvaluationsToVurderingMap drops unknown or incomplete evaluation results", () => {
    const vurderingMap = mapRawEvaluationsToVurderingMap(
      [ORGNUMMER_1, ORGNUMMER_2, ORGNUMMER_3, ORGNUMMER_4],
      [
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_2,
          status: "UKJENT_STATUS",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_3,
          status: null,
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_4,
          status: "TILTAKSGRUPPE",
          toggleId: "ANNEN_TOGGLE",
        },
        {
          orgnummer: UKJENT_ORGNUMMER,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: "",
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    );

    expect(vurderingMap).toEqual({
      vurderinger: [
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
  });

  it("mapRawEvaluationsToVurderingMap keeps the first evaluation for duplicate authorized orgnummer", () => {
    const vurderingMap = mapRawEvaluationsToVurderingMap(
      [ORGNUMMER_1],
      [
        {
          orgnummer: ORGNUMMER_1,
          status: "KONTROLLGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    );

    expect(vurderingMap).toEqual({
      vurderinger: [
        {
          orgnummer: ORGNUMMER_1,
          status: "KONTROLLGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
  });

  it("mapRawEvaluationsToVurderingMap follows authorized orgnummer order even when evaluations are shuffled", () => {
    const vurderingMap = mapRawEvaluationsToVurderingMap(
      [ORGNUMMER_3, ORGNUMMER_1, ORGNUMMER_2],
      [
        {
          orgnummer: ORGNUMMER_2,
          status: "KONTROLLGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_1,
          status: "UTENFOR_SCOPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_3,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    );

    expect(vurderingMap).toEqual({
      vurderinger: [
        {
          orgnummer: ORGNUMMER_3,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_1,
          status: "UTENFOR_SCOPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_2,
          status: "KONTROLLGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
  });

  it("returns an empty vurdering-map without backend calls when the kill-switch is off", async () => {
    isTiltakspakkevurderingFeatureToggleEnabledMock.mockReturnValue(false);

    const vurderingMap = await getTiltakspakkevurderingMap(resolverContextType);

    expect(vurderingMap).toEqual({
      vurderinger: [],
    });
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expect(mockDbSykmeldteMock).not.toHaveBeenCalled();
  });

  it("returns a fresh empty vurdering-map for repeated empty responses", async () => {
    isTiltakspakkevurderingFeatureToggleEnabledMock.mockReturnValue(false);

    const firstVurderingMap =
      await getTiltakspakkevurderingMap(resolverContextType);

    firstVurderingMap.vurderinger.push({
      orgnummer: ORGNUMMER_1,
      status: "TILTAKSGRUPPE",
      toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
    });

    const secondVurderingMap =
      await getTiltakspakkevurderingMap(resolverContextType);

    expect(secondVurderingMap).toEqual({
      vurderinger: [],
    });
  });

  it("uses getMineSykmeldte and maps authorized orgnummer when non-local and the kill-switch is on", async () => {
    envState.isLocalOrDemo = false;
    getMineSykmeldteMock.mockResolvedValue([
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_1,
        fnr: FNR,
        navn: NAVN,
        narmestelederId: NARMESTELEDER_ID,
      }),
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_1,
        fnr: "00000000001",
        navn: "Synthetic Person 1",
        narmestelederId: "narmesteleder-2",
      }),
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_2,
        fnr: "00000000002",
        navn: "Synthetic Person 2",
        narmestelederId: "narmesteleder-3",
      }),
    ]);

    const vurderingMap = await getTiltakspakkevurderingMap(resolverContextType);

    expect(vurderingMap).toEqual({
      vurderinger: [
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_2,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
    expect(getMineSykmeldteMock).toHaveBeenCalledWith(resolverContextType);
    expect(mockDbSykmeldteMock).not.toHaveBeenCalled();
  });

  it("uses local mock data without calling getMineSykmeldte when local and the kill-switch is on", async () => {
    envState.isLocalOrDemo = true;
    mockDbSykmeldteMock.mockReturnValue([
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_1,
        fnr: FNR,
        navn: NAVN,
        narmestelederId: NARMESTELEDER_ID,
      }),
      createPreviewSykmeldt({
        orgnummer: ORGNUMMER_2,
        fnr: "00000000001",
        navn: "Synthetic Person 1",
        narmestelederId: "narmesteleder-2",
      }),
    ]);

    const vurderingMap = await getTiltakspakkevurderingMap(resolverContextType);

    expect(vurderingMap).toEqual({
      vurderinger: [
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
        {
          orgnummer: ORGNUMMER_2,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expect(mockDbSykmeldteMock).toHaveBeenCalled();
  });

  it("returns an empty vurdering-map when no authorized orgnummer can be derived", async () => {
    getMineSykmeldteMock.mockResolvedValue([
      createPreviewSykmeldt({
        orgnummer: "",
        fnr: FNR,
        navn: NAVN,
        narmestelederId: NARMESTELEDER_ID,
      }),
    ]);

    const vurderingMap = await getTiltakspakkevurderingMap(resolverContextType);

    expect(vurderingMap).toEqual({
      vurderinger: [],
    });
  });

  it("returns an empty vurdering-map and logs without PII when orgnummer lookup fails", async () => {
    const errorSpy = spyOnLogger("error");
    getMineSykmeldteMock.mockRejectedValue(
      new Error(
        `failed for ${ORGNUMMER_1}, ${FNR}, ${NAVN}, ${NARMESTELEDER_ID}`,
      ),
    );

    const vurderingMap = await getTiltakspakkevurderingMap(resolverContextType);

    expect(vurderingMap).toEqual({
      vurderinger: [],
    });
    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });
});

function expectLogCallsWithoutPii(calls: unknown[][]): void {
  const serializedCalls = JSON.stringify(calls, (_key, value: unknown) => {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}`;
    }

    return value;
  });

  expect(serializedCalls).not.toContain(ORGNUMMER_1);
  expect(serializedCalls).not.toContain(FNR);
  expect(serializedCalls).not.toContain(NAVN);
  expect(serializedCalls).not.toContain(NARMESTELEDER_ID);
}

function spyOnLogger(
  method: "error",
): MockInstance<(...args: unknown[]) => void> {
  return vi.spyOn(logger, method).mockImplementation(() => undefined);
}
