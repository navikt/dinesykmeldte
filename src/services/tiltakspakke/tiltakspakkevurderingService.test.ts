import { logger } from "@navikt/next-logger";
import type { MockInstance } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { createPreviewSykmeldt } from "../../utils/test/dataCreators";
import { OPPFOLGINGSPLAN_TILTAKSPAKKE_1 } from "./tiltakspakkevurderingContract";
import {
  extractAuthorizedOrgnumre,
  getTiltakspakkevurderinger,
  mapRawEvaluationsToVurderinger,
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

  it("mapRawEvaluationsToVurderinger returns an empty array for no evaluations", () => {
    const vurderinger = mapRawEvaluationsToVurderinger(
      [ORGNUMMER_1, ORGNUMMER_2],
      [],
    );

    expect(vurderinger).toEqual([]);
  });

  it("mapRawEvaluationsToVurderinger keeps the matching tiltakspakkeId with empty virksomheter when virksomheter is missing or null", () => {
    const vurderinger = mapRawEvaluationsToVurderinger(
      [ORGNUMMER_1, ORGNUMMER_2],
      [
        { tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1 },
        { tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1, virksomheter: null },
      ],
    );

    expect(vurderinger).toEqual([
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [],
      },
    ]);
  });

  it("mapRawEvaluationsToVurderinger keeps the contracted deltakelse per authorized orgnummer", () => {
    const vurderinger = mapRawEvaluationsToVurderinger(
      [ORGNUMMER_1, ORGNUMMER_2, ORGNUMMER_3],
      [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" },
            { orgnummer: ORGNUMMER_2, deltakelse: "KONTROLLGRUPPE" },
            { orgnummer: ORGNUMMER_3, deltakelse: "UTENFOR_SCOPE" },
          ],
        },
      ],
    );

    expect(vurderinger).toEqual([
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [
          { orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" },
          { orgnummer: ORGNUMMER_2, deltakelse: "KONTROLLGRUPPE" },
          { orgnummer: ORGNUMMER_3, deltakelse: "UTENFOR_SCOPE" },
        ],
      },
    ]);
  });

  it("mapRawEvaluationsToVurderinger drops unknown or incomplete virksomheter", () => {
    const vurderinger = mapRawEvaluationsToVurderinger(
      [ORGNUMMER_1, ORGNUMMER_2, ORGNUMMER_3, ORGNUMMER_4],
      [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" },
            { orgnummer: ORGNUMMER_2, deltakelse: "UKJENT_DELTAKELSE" },
            { orgnummer: ORGNUMMER_3, deltakelse: null },
            { orgnummer: UKJENT_ORGNUMMER, deltakelse: "TILTAKSGRUPPE" },
            { orgnummer: "", deltakelse: "TILTAKSGRUPPE" },
          ],
        },
        {
          tiltakspakkeId: "ANNEN_TILTAKSPAKKE",
          virksomheter: [
            { orgnummer: ORGNUMMER_4, deltakelse: "TILTAKSGRUPPE" },
          ],
        },
      ],
    );

    expect(vurderinger).toEqual([
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [{ orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" }],
      },
    ]);
  });

  it("mapRawEvaluationsToVurderinger keeps the first virksomhet for duplicate authorized orgnummer", () => {
    const vurderinger = mapRawEvaluationsToVurderinger(
      [ORGNUMMER_1],
      [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: ORGNUMMER_1, deltakelse: "KONTROLLGRUPPE" },
            { orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" },
          ],
        },
      ],
    );

    expect(vurderinger).toEqual([
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [
          { orgnummer: ORGNUMMER_1, deltakelse: "KONTROLLGRUPPE" },
        ],
      },
    ]);
  });

  it("mapRawEvaluationsToVurderinger follows authorized orgnummer order even when virksomheter are shuffled", () => {
    const vurderinger = mapRawEvaluationsToVurderinger(
      [ORGNUMMER_3, ORGNUMMER_1, ORGNUMMER_2],
      [
        {
          tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
          virksomheter: [
            { orgnummer: ORGNUMMER_2, deltakelse: "KONTROLLGRUPPE" },
            { orgnummer: ORGNUMMER_1, deltakelse: "UTENFOR_SCOPE" },
            { orgnummer: ORGNUMMER_3, deltakelse: "TILTAKSGRUPPE" },
          ],
        },
      ],
    );

    expect(vurderinger).toEqual([
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [
          { orgnummer: ORGNUMMER_3, deltakelse: "TILTAKSGRUPPE" },
          { orgnummer: ORGNUMMER_1, deltakelse: "UTENFOR_SCOPE" },
          { orgnummer: ORGNUMMER_2, deltakelse: "KONTROLLGRUPPE" },
        ],
      },
    ]);
  });

  it("returns an empty vurderinger-array without backend calls when the kill-switch is off", async () => {
    isTiltakspakkevurderingFeatureToggleEnabledMock.mockReturnValue(false);

    const vurderinger = await getTiltakspakkevurderinger(resolverContextType);

    expect(vurderinger).toEqual([]);
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expect(mockDbSykmeldteMock).not.toHaveBeenCalled();
  });

  it("returns a fresh empty vurderinger-array for repeated empty responses", async () => {
    isTiltakspakkevurderingFeatureToggleEnabledMock.mockReturnValue(false);

    const firstVurderinger =
      await getTiltakspakkevurderinger(resolverContextType);

    firstVurderinger.push({
      tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
      virksomheter: [{ orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" }],
    });

    const secondVurderinger =
      await getTiltakspakkevurderinger(resolverContextType);

    expect(secondVurderinger).toEqual([]);
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

    const vurderinger = await getTiltakspakkevurderinger(resolverContextType);

    expect(vurderinger).toEqual([
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [
          { orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" },
          { orgnummer: ORGNUMMER_2, deltakelse: "TILTAKSGRUPPE" },
        ],
      },
    ]);
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

    const vurderinger = await getTiltakspakkevurderinger(resolverContextType);

    expect(vurderinger).toEqual([
      {
        tiltakspakkeId: OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
        virksomheter: [
          { orgnummer: ORGNUMMER_1, deltakelse: "TILTAKSGRUPPE" },
          { orgnummer: ORGNUMMER_2, deltakelse: "TILTAKSGRUPPE" },
        ],
      },
    ]);
    expect(getMineSykmeldteMock).not.toHaveBeenCalled();
    expect(mockDbSykmeldteMock).toHaveBeenCalled();
  });

  it("returns an empty vurderinger-array when no authorized orgnummer can be derived", async () => {
    getMineSykmeldteMock.mockResolvedValue([
      createPreviewSykmeldt({
        orgnummer: "",
        fnr: FNR,
        navn: NAVN,
        narmestelederId: NARMESTELEDER_ID,
      }),
    ]);

    const vurderinger = await getTiltakspakkevurderinger(resolverContextType);

    expect(vurderinger).toEqual([]);
  });

  it("returns an empty vurderinger-array and logs without PII when orgnummer lookup fails", async () => {
    const errorSpy = spyOnLogger("error");
    getMineSykmeldteMock.mockRejectedValue(
      new Error(
        `failed for ${ORGNUMMER_1}, ${FNR}, ${NAVN}, ${NARMESTELEDER_ID}`,
      ),
    );

    const vurderinger = await getTiltakspakkevurderinger(resolverContextType);

    expect(vurderinger).toEqual([]);
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
