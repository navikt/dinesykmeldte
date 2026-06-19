import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createResolverContextType,
  withAuthenticatedApi,
} from "../../../auth/withAuthentication";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import { getMineSykmeldte } from "../../../services/minesykmeldte/mineSykmeldteService";
import {
  type AvbestillPaaminnelseResponse,
  AvbestillPaaminnelseResponseSchema,
  BestillPaaminnelseRequestSchema,
  type BestillPaaminnelseResponse,
  BestillPaaminnelseResponseSchema,
  type HentPaaminnelseStatusResponse,
  HentPaaminnelseStatusResponseSchema,
  type PaaminnelseFeilResponse,
  PaaminnelseFeilResponseSchema,
} from "../../../services/paaminnelse/paaminnelseContract";
import {
  getLocalDemoPaaminnelseMockResponse,
  PAAMINNELSE_MOCK_QUERY_PARAM,
  resolveLocalDemoPaaminnelseMockScenario,
} from "../../../services/paaminnelse/paaminnelseMock";
import {
  avbestillPaaminnelse,
  bestillPaaminnelse,
  hentPaaminnelseStatus,
  PaaminnelseAdapterError,
} from "../../../services/paaminnelse/paaminnelseService";
import type { PaaminnelseIdentifikatorer } from "../../../services/paaminnelse/schema/paaminnelse";
import { getTiltakspakkeStatus } from "../../../services/tiltakspakke/tiltakspakkeService";
import {
  isLocalOrDemo,
  isPaaminnelseDevOverrideEnabled,
} from "../../../utils/env";

const ALLOWED_METHODS = ["GET", "POST", "DELETE"] as const;
const SKJULT_RESPONSE = HentPaaminnelseStatusResponseSchema.parse({
  status: "SKJULT",
});
const DEV_OVERRIDE_GET_RESPONSE = HentPaaminnelseStatusResponseSchema.parse({
  status: "TILBUD",
});
const DEV_OVERRIDE_POST_RESPONSE = BestillPaaminnelseResponseSchema.parse({
  status: "BESTILT",
});
const DEV_OVERRIDE_DELETE_RESPONSE = AvbestillPaaminnelseResponseSchema.parse({
  status: "TILBUD",
});

type AllowedMethod = (typeof ALLOWED_METHODS)[number];
type WriteMethod = Extract<AllowedMethod, "POST" | "DELETE">;
type RouteResponseBody =
  | HentPaaminnelseStatusResponse
  | BestillPaaminnelseResponse
  | AvbestillPaaminnelseResponse
  | PaaminnelseFeilResponse;
type RouteFeilkode = PaaminnelseFeilResponse["feilkode"];

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<RouteResponseBody>,
): Promise<void> => {
  if (!isAllowedMethod(req.method)) {
    res.setHeader("Allow", ALLOWED_METHODS.join(", "));
    sendErrorResponse(res, 405, "UGYLDIG_FORESPORSEL");
    return;
  }

  if (isLocalOrDemo) {
    handleLocalDemoRequest(req.method, req, res);
    return;
  }

  const resolverContextType = createResolverContextType(req);
  if (!resolverContextType) {
    logger.error("Missing resolver context for paaminnelse API route");
    sendErrorResponse(res, 401, "IKKE_AUTORISERT");
    return;
  }

  const narmestelederId = getRouteParam(req.query.narmestelederId);
  if (narmestelederId == null) {
    logger.warn(
      { xRequestId: resolverContextType.xRequestId ?? "unknown" },
      "Invalid paaminnelse API route parameter",
    );
    sendErrorResponse(res, 400, "UGYLDIG_FORESPORSEL");
    return;
  }

  try {
    const identifikatorer = await resolveAuthorizedIdentifikatorer(
      narmestelederId,
      resolverContextType,
    );
    if (identifikatorer == null) {
      logger.warn(
        { xRequestId: resolverContextType.xRequestId ?? "unknown" },
        "Paaminnelse API authorization failed",
      );
      sendErrorResponse(res, 403, "IKKE_AUTORISERT");
      return;
    }

    if (
      req.method === "POST" &&
      !BestillPaaminnelseRequestSchema.safeParse(req.body).success
    ) {
      sendErrorResponse(res, 400, "UGYLDIG_FORESPORSEL");
      return;
    }

    if (isPaaminnelseDevOverrideEnabled()) {
      sendDevOverrideResponse(req.method, res);
      return;
    }

    switch (req.method) {
      case "GET":
        await handleGetRequest(res, identifikatorer, resolverContextType);
        return;
      case "POST":
      case "DELETE":
        await handleWriteRequest(
          req.method,
          res,
          identifikatorer,
          resolverContextType,
        );
        return;
    }
  } catch (error: unknown) {
    if (error instanceof PaaminnelseAdapterError) {
      sendErrorResponse(res, 502, error.feilkode);
      return;
    }

    const feilkode = getUnexpectedFeilkode(req.method);
    logger.error(
      {
        xRequestId: resolverContextType.xRequestId ?? "unknown",
        feilkode,
      },
      "Paaminnelse API route failed",
    );
    sendErrorResponse(res, 502, feilkode);
  }
};

function handleLocalDemoRequest(
  method: AllowedMethod,
  req: NextApiRequest,
  res: NextApiResponse<RouteResponseBody>,
): void {
  if (getRouteParam(req.query.narmestelederId) == null) {
    logger.warn("Invalid paaminnelse API route parameter");
    sendErrorResponse(res, 400, "UGYLDIG_FORESPORSEL");
    return;
  }

  if (
    method === "POST" &&
    !BestillPaaminnelseRequestSchema.safeParse(req.body).success
  ) {
    sendErrorResponse(res, 400, "UGYLDIG_FORESPORSEL");
    return;
  }

  const mockScenario = resolveLocalDemoPaaminnelseMockScenario({
    queryValue: req.query[PAAMINNELSE_MOCK_QUERY_PARAM],
    referer: req.headers.referer,
  });
  if (mockScenario === "invalid") {
    sendErrorResponse(res, 400, "UGYLDIG_FORESPORSEL");
    return;
  }

  const response = getLocalDemoPaaminnelseMockResponse(method, mockScenario);
  res.status(response.statusCode).json(response.body);
}

async function handleGetRequest(
  res: NextApiResponse<RouteResponseBody>,
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<void> {
  const tiltakspakkeStatus = await getTiltakspakkeStatus(
    identifikatorer.orgnummer,
    context,
  );

  if (tiltakspakkeStatus !== "DELTAR_I_TILTAKSGRUPPE") {
    res.status(200).json(SKJULT_RESPONSE);
    return;
  }

  const statusResponse = HentPaaminnelseStatusResponseSchema.parse(
    await hentPaaminnelseStatus(identifikatorer, context),
  );

  res.status(200).json(statusResponse);
}

async function handleWriteRequest(
  method: WriteMethod,
  res: NextApiResponse<RouteResponseBody>,
  identifikatorer: PaaminnelseIdentifikatorer,
  context: ResolverContextType,
): Promise<void> {
  const tiltakspakkeStatus = await getTiltakspakkeStatus(
    identifikatorer.orgnummer,
    context,
  );

  if (tiltakspakkeStatus !== "DELTAR_I_TILTAKSGRUPPE") {
    sendErrorResponse(res, 403, "IKKE_AUTORISERT");
    return;
  }

  if (method === "POST") {
    const response = BestillPaaminnelseResponseSchema.parse(
      await bestillPaaminnelse(identifikatorer, context),
    );
    res.status(200).json(response);
    return;
  }

  const response = AvbestillPaaminnelseResponseSchema.parse(
    await avbestillPaaminnelse(identifikatorer, context),
  );
  res.status(200).json(response);
}

function sendDevOverrideResponse(
  method: AllowedMethod,
  res: NextApiResponse<RouteResponseBody>,
): void {
  switch (method) {
    case "GET":
      res.status(200).json(DEV_OVERRIDE_GET_RESPONSE);
      return;
    case "POST":
      res.status(200).json(DEV_OVERRIDE_POST_RESPONSE);
      return;
    case "DELETE":
      res.status(200).json(DEV_OVERRIDE_DELETE_RESPONSE);
      return;
  }
}

function isAllowedMethod(method: string | undefined): method is AllowedMethod {
  return method != null && ALLOWED_METHODS.includes(method as AllowedMethod);
}

function getRouteParam(
  routeParam: string | string[] | undefined,
): string | null {
  return typeof routeParam === "string" && routeParam.length > 0
    ? routeParam
    : null;
}

async function resolveAuthorizedIdentifikatorer(
  narmestelederId: string,
  context: ResolverContextType,
): Promise<PaaminnelseIdentifikatorer | null> {
  const sykmeldte = await getMineSykmeldte(context);
  const authorizedSykmeldt = sykmeldte.find(
    (sykmeldt) => sykmeldt.narmestelederId === narmestelederId,
  );

  if (!authorizedSykmeldt) {
    return null;
  }

  if (authorizedSykmeldt.fnr) {
    return {
      narmestelederId,
      orgnummer: authorizedSykmeldt.orgnummer,
      fnr: authorizedSykmeldt.fnr,
    };
  }

  return {
    narmestelederId,
    orgnummer: authorizedSykmeldt.orgnummer,
  };
}

function getUnexpectedFeilkode(method: AllowedMethod): RouteFeilkode {
  switch (method) {
    case "GET":
      return "STATUS_FEILET";
    case "POST":
      return "BESTILLING_FEILET";
    case "DELETE":
      return "AVBESTILLING_FEILET";
  }
}

function sendErrorResponse(
  res: NextApiResponse<RouteResponseBody>,
  statusCode: number,
  feilkode: RouteFeilkode,
): void {
  res
    .status(statusCode)
    .json(PaaminnelseFeilResponseSchema.parse({ feilkode }));
}

export default withAuthenticatedApi(handler);
