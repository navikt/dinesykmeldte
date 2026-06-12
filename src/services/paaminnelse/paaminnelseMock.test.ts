import { describe, expect, it } from "vitest";
import {
  getLocalDemoPaaminnelseMockResponse,
  PAAMINNELSE_MOCK_QUERY_PARAM,
  resolveLocalDemoPaaminnelseMockScenario,
} from "./paaminnelseMock";

describe("resolveLocalDemoPaaminnelseMockScenario", () => {
  it("returns null when no mock query is set", () => {
    expect(
      resolveLocalDemoPaaminnelseMockScenario({
        queryValue: undefined,
        referer: undefined,
      }),
    ).toBeNull();
  });

  it("reads a valid mock query from the API request", () => {
    expect(
      resolveLocalDemoPaaminnelseMockScenario({
        queryValue: "bestilt",
        referer: "https://example.test/app?paaminnelseMock=skjult",
      }),
    ).toBe("bestilt");
  });

  it("reads a valid mock query from the referer when API query is missing", () => {
    expect(
      resolveLocalDemoPaaminnelseMockScenario({
        queryValue: undefined,
        referer:
          "https://example.test/app/sykmeldt/mock?paaminnelseMock=avbestill-feiler",
      }),
    ).toBe("avbestill-feiler");
  });

  it("returns invalid for unknown mock query values", () => {
    expect(
      resolveLocalDemoPaaminnelseMockScenario({
        queryValue: "ukjent-state",
        referer: undefined,
      }),
    ).toBe("invalid");
  });

  it("returns invalid when referer contains the mock query multiple times", () => {
    expect(
      resolveLocalDemoPaaminnelseMockScenario({
        queryValue: undefined,
        referer: `https://example.test/app?${PAAMINNELSE_MOCK_QUERY_PARAM}=tilbud&${PAAMINNELSE_MOCK_QUERY_PARAM}=bestilt`,
      }),
    ).toBe("invalid");
  });
});

describe("getLocalDemoPaaminnelseMockResponse", () => {
  it("returns tilbud by default for GET in local/demo", () => {
    expect(getLocalDemoPaaminnelseMockResponse("GET", null)).toEqual({
      statusCode: 200,
      body: { status: "TILBUD" },
    });
  });

  it("returns skjult when skjult scenario is selected", () => {
    expect(getLocalDemoPaaminnelseMockResponse("GET", "skjult")).toEqual({
      statusCode: 200,
      body: { status: "SKJULT" },
    });
  });

  it("returns bestilt with reminder timing for GET bestilt", () => {
    expect(getLocalDemoPaaminnelseMockResponse("GET", "bestilt")).toEqual({
      statusCode: 200,
      body: {
        status: "BESTILT",
        reminderTiming: {
          code: "BEFORE_4_WEEKS",
          textKey: "paaminnelse.beforeFourWeeks",
          triggerAt: "2026-02-03T09:00:00.000+01:00",
        },
      },
    });
  });

  it("returns bestilling-feilet for POST bestill-feiler", () => {
    expect(
      getLocalDemoPaaminnelseMockResponse("POST", "bestill-feiler"),
    ).toEqual({
      statusCode: 502,
      body: { feilkode: "BESTILLING_FEILET" },
    });
  });

  it("returns avbestilling-feilet for DELETE avbestill-feiler", () => {
    expect(
      getLocalDemoPaaminnelseMockResponse("DELETE", "avbestill-feiler"),
    ).toEqual({
      statusCode: 502,
      body: { feilkode: "AVBESTILLING_FEILET" },
    });
  });
});
