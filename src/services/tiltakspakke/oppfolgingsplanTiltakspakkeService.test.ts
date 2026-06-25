import { logger } from "@navikt/next-logger";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { createPreviewSykmeldt } from "../../utils/test/dataCreators";
import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "./oppfolgingsplanTiltakspakkeContract";
import {
  extractAuthorizedOrgnumre,
  getOppfolgingsplanTiltakspakkeGateMap,
  mapRawEvaluationsToGateMap,
} from "./oppfolgingsplanTiltakspakkeService";

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
});

describe("oppfolgingsplanTiltakspakkeService", () => {
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

  it("mapRawEvaluationsToGateMap keeps the contracted statuses per authorized orgnummer", () => {
    const gateMap = mapRawEvaluationsToGateMap(
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

    expect(gateMap).toEqual({
      gates: [
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

  it("mapRawEvaluationsToGateMap drops unknown or incomplete evaluation results", () => {
    const gateMap = mapRawEvaluationsToGateMap(
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

    expect(gateMap).toEqual({
      gates: [
        {
          orgnummer: ORGNUMMER_1,
          status: "TILTAKSGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
  });

  it("mapRawEvaluationsToGateMap keeps the first evaluation for duplicate authorized orgnummer", () => {
    const gateMap = mapRawEvaluationsToGateMap(
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

    expect(gateMap).toEqual({
      gates: [
        {
          orgnummer: ORGNUMMER_1,
          status: "KONTROLLGRUPPE",
          toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        },
      ],
    });
  });

  it("mapRawEvaluationsToGateMap follows authorized orgnummer order even when evaluations are shuffled", () => {
    const gateMap = mapRawEvaluationsToGateMap(
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

    expect(gateMap).toEqual({
      gates: [
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

  it("returns an empty gate-map without backend calls when the kill-switch is off", async () => {
    const getMineSykmeldteMock = vi.fn();
    const evaluateOrgnumreMock = vi.fn();

    const gateMap = await getOppfolgingsplanTiltakspakkeGateMap(
      resolverContextType,
      {
        getMineSykmeldte: getMineSykmeldteMock,
        evaluateOrgnumre: evaluateOrgnumreMock,
        isFeatureEnabled: () => false,
      },
    );

    expect(gateMap).toEqual({
      gates: [],
    });
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expect(evaluateOrgnumreMock).not.toHaveBeenCalled();
  });

  it("returns a fresh empty gate-map for repeated empty responses", async () => {
    const firstGateMap = await getOppfolgingsplanTiltakspakkeGateMap(
      resolverContextType,
      {
        isFeatureEnabled: () => false,
      },
    );

    firstGateMap.gates.push({
      orgnummer: ORGNUMMER_1,
      status: "TILTAKSGRUPPE",
      toggleId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
    });

    const secondGateMap = await getOppfolgingsplanTiltakspakkeGateMap(
      resolverContextType,
      {
        isFeatureEnabled: () => false,
      },
    );

    expect(secondGateMap).toEqual({
      gates: [],
    });
  });

  it("returns active mock gates for authorized orgnummer when the kill-switch is on", async () => {
    const getMineSykmeldteMock = vi.fn().mockResolvedValue([
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

    const gateMap = await getOppfolgingsplanTiltakspakkeGateMap(
      resolverContextType,
      {
        getMineSykmeldte: getMineSykmeldteMock,
        isFeatureEnabled: () => true,
      },
    );

    expect(gateMap).toEqual({
      gates: [
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
  });

  it("returns an empty gate-map when no authorized orgnummer can be derived", async () => {
    const evaluateOrgnumreMock = vi.fn();

    const gateMap = await getOppfolgingsplanTiltakspakkeGateMap(
      resolverContextType,
      {
        getMineSykmeldte: vi.fn().mockResolvedValue([
          createPreviewSykmeldt({
            orgnummer: "",
            fnr: FNR,
            navn: NAVN,
            narmestelederId: NARMESTELEDER_ID,
          }),
        ]),
        evaluateOrgnumre: evaluateOrgnumreMock,
        isFeatureEnabled: () => true,
      },
    );

    expect(gateMap).toEqual({
      gates: [],
    });
    expect(evaluateOrgnumreMock).not.toHaveBeenCalled();
  });

  it("returns an empty gate-map and logs without PII when orgnummer lookup fails", async () => {
    const errorSpy = spyOnLogger("error");

    const gateMap = await getOppfolgingsplanTiltakspakkeGateMap(
      resolverContextType,
      {
        getMineSykmeldte: vi
          .fn()
          .mockRejectedValue(
            new Error(
              `failed for ${ORGNUMMER_1}, ${FNR}, ${NAVN}, ${NARMESTELEDER_ID}`,
            ),
          ),
        isFeatureEnabled: () => true,
      },
    );

    expect(gateMap).toEqual({
      gates: [],
    });
    expect(errorSpy).toHaveBeenCalled();
    expectLogCallsWithoutPii(errorSpy.mock.calls);
  });

  it("returns an empty gate-map and logs without PII when evaluation fails", async () => {
    const errorSpy = spyOnLogger("error");

    const gateMap = await getOppfolgingsplanTiltakspakkeGateMap(
      resolverContextType,
      {
        getMineSykmeldte: vi.fn().mockResolvedValue([
          createPreviewSykmeldt({
            orgnummer: ORGNUMMER_1,
            fnr: FNR,
            navn: NAVN,
            narmestelederId: NARMESTELEDER_ID,
          }),
        ]),
        evaluateOrgnumre: vi
          .fn()
          .mockRejectedValue(new Error(`failed for ${ORGNUMMER_1} and ${FNR}`)),
        isFeatureEnabled: () => true,
      },
    );

    expect(gateMap).toEqual({
      gates: [],
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
