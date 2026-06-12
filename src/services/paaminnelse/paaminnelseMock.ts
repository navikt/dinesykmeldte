import { z } from "zod";
import {
  type AvbestillPaaminnelseResponse,
  AvbestillPaaminnelseResponseSchema,
  type BestillPaaminnelseResponse,
  BestillPaaminnelseResponseSchema,
  type HentPaaminnelseStatusResponse,
  HentPaaminnelseStatusResponseSchema,
  type PaaminnelseFeilResponse,
  PaaminnelseFeilResponseSchema,
} from "./paaminnelseContract";

export const PAAMINNELSE_MOCK_QUERY_PARAM = "paaminnelseMock";

const LocalDemoPaaminnelseMockScenarioSchema = z.enum([
  "skjult",
  "tilbud",
  "bestilt",
  "bestill-feiler",
  "avbestill-feiler",
]);

export type LocalDemoPaaminnelseMockScenario = z.infer<
  typeof LocalDemoPaaminnelseMockScenarioSchema
>;
export type ResolvedLocalDemoPaaminnelseMockScenario =
  | LocalDemoPaaminnelseMockScenario
  | null
  | "invalid";
type LocalDemoMethod = "GET" | "POST" | "DELETE";

export type LocalDemoPaaminnelseMockResponse = {
  statusCode: 200 | 502;
  body:
    | HentPaaminnelseStatusResponse
    | BestillPaaminnelseResponse
    | AvbestillPaaminnelseResponse
    | PaaminnelseFeilResponse;
};

const BESTILT_STATUS = {
  status: "BESTILT",
  reminderTiming: {
    code: "BEFORE_4_WEEKS",
    textKey: "paaminnelse.beforeFourWeeks",
    triggerAt: "2026-02-03T09:00:00.000+01:00",
  },
} as const;

export function resolveLocalDemoPaaminnelseMockScenario({
  queryValue,
  referer,
}: {
  queryValue: string | string[] | undefined;
  referer: string | string[] | undefined;
}): ResolvedLocalDemoPaaminnelseMockScenario {
  const directQueryValue = normalizeQueryValue(queryValue);
  if (directQueryValue === "invalid") {
    return "invalid";
  }

  if (directQueryValue != null) {
    return parseScenario(directQueryValue);
  }

  const refererQueryValue = getQueryValueFromReferer(referer);
  if (refererQueryValue === "invalid") {
    return "invalid";
  }

  if (refererQueryValue == null) {
    return null;
  }

  return parseScenario(refererQueryValue);
}

export function getLocalDemoPaaminnelseMockResponse(
  method: LocalDemoMethod,
  scenario: LocalDemoPaaminnelseMockScenario | null,
): LocalDemoPaaminnelseMockResponse {
  switch (method) {
    case "GET":
      return {
        statusCode: 200,
        body: getLocalDemoReadResponse(scenario),
      };
    case "POST":
      if (scenario === "bestill-feiler") {
        return {
          statusCode: 502,
          body: PaaminnelseFeilResponseSchema.parse({
            feilkode: "BESTILLING_FEILET",
          }),
        };
      }

      return {
        statusCode: 200,
        body: BestillPaaminnelseResponseSchema.parse(BESTILT_STATUS),
      };
    case "DELETE":
      if (scenario === "avbestill-feiler") {
        return {
          statusCode: 502,
          body: PaaminnelseFeilResponseSchema.parse({
            feilkode: "AVBESTILLING_FEILET",
          }),
        };
      }

      return {
        statusCode: 200,
        body: AvbestillPaaminnelseResponseSchema.parse({ status: "TILBUD" }),
      };
  }
}

function getLocalDemoReadResponse(
  scenario: LocalDemoPaaminnelseMockScenario | null,
): HentPaaminnelseStatusResponse {
  switch (scenario) {
    case "skjult":
      return HentPaaminnelseStatusResponseSchema.parse({ status: "SKJULT" });
    case "bestilt":
    case "avbestill-feiler":
      return HentPaaminnelseStatusResponseSchema.parse(BESTILT_STATUS);
    case null:
    case "tilbud":
    case "bestill-feiler":
      return HentPaaminnelseStatusResponseSchema.parse({ status: "TILBUD" });
  }
}

function normalizeQueryValue(
  queryValue: string | string[] | undefined,
): string | null | "invalid" {
  if (queryValue == null) {
    return null;
  }

  if (typeof queryValue !== "string" || queryValue.length === 0) {
    return "invalid";
  }

  return queryValue;
}

function getQueryValueFromReferer(
  referer: string | string[] | undefined,
): string | null | "invalid" {
  if (referer == null) {
    return null;
  }

  if (typeof referer !== "string" || referer.length === 0) {
    return "invalid";
  }

  try {
    const refererUrl = new URL(referer, "https://local.invalid");
    const values = refererUrl.searchParams.getAll(PAAMINNELSE_MOCK_QUERY_PARAM);

    if (values.length === 0) {
      return null;
    }

    if (values.length !== 1 || values[0].length === 0) {
      return "invalid";
    }

    return values[0];
  } catch {
    return null;
  }
}

function parseScenario(
  value: string,
): LocalDemoPaaminnelseMockScenario | "invalid" {
  const parseResult = LocalDemoPaaminnelseMockScenarioSchema.safeParse(value);

  return parseResult.success ? parseResult.data : "invalid";
}
