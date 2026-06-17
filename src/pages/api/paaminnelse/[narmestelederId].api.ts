import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createResolverContextType,
  withAuthenticatedApi,
} from "../../../auth/withAuthentication";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import { getMineSykmeldte } from "../../../services/minesykmeldte/mineSykmeldteService";
import {
  BestillPaaminnelseRequestSchema,
  type PaaminnelseFeilResponse,
  type PaaminnelseIdentifikatorer,
  type PaaminnelseStatus,
} from "../../../services/paaminnelse/paaminnelseContract";
import {
  avbestillPaaminnelse,
  bestillPaaminnelse,
  hentPaaminnelseStatus,
  PaaminnelseAdapterError,
} from "../../../services/paaminnelse/paaminnelseService";
import { isPaaminnelseFeatureToggleEnabled } from "../../../utils/env";

const ALLOWED_METHODS = ["GET", "POST", "DELETE"] as const;
const SKJULT_RESPONSE: PaaminnelseStatus = { status: "SKJULT" };

type AllowedMethod = (typeof ALLOWED_METHODS)[number];
type RouteResponseBody = PaaminnelseStatus | PaaminnelseFeilResponse;
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

  const context = createResolverContextType(req);
  if (!context) {
    logger.error("Missing resolver context for paaminnelse API route");
    sendErrorResponse(res, 401, "IKKE_AUTORISERT");
    return;
  }

  const narmestelederId = getRouteParam(req.query.narmestelederId);
  if (narmestelederId == null) {
    logger.warn(
      { xRequestId: context.xRequestId ?? "unknown" },
      "Invalid paaminnelse API route parameter",
    );
    sendErrorResponse(res, 400, "UGYLDIG_FORESPORSEL");
    return;
  }

  try {
    if (!isPaaminnelseFeatureToggleEnabled()) {
      sendFeatureDisabledResponse(req.method, res);
      return;
    }

    if (
      req.method === "POST" &&
      !BestillPaaminnelseRequestSchema.safeParse(req.body).success
    ) {
      sendErrorResponse(res, 400, "UGYLDIG_FORESPORSEL");
      return;
    }

    const identifikatorer = await resolveAuthorizedIdentifikatorer(
      narmestelederId,
      context,
    );
    if (identifikatorer == null) {
      logger.warn(
        { xRequestId: context.xRequestId ?? "unknown" },
        "Paaminnelse API authorization failed",
      );
      sendErrorResponse(res, 403, "IKKE_AUTORISERT");
      return;
    }

    switch (req.method) {
      case "GET":
        res
          .status(200)
          .json(await hentPaaminnelseStatus(identifikatorer, context));
        return;
      case "POST":
        res
          .status(200)
          .json(await bestillPaaminnelse(identifikatorer, context));
        return;
      case "DELETE":
        res
          .status(200)
          .json(await avbestillPaaminnelse(identifikatorer, context));
        return;
    }
  } catch (error: unknown) {
    if (error instanceof PaaminnelseAdapterError) {
      sendErrorResponse(res, 502, error.feilkode);
      return;
    }

    const feilkode = getUnexpectedFeilkode(req.method);
    logger.error(
      { xRequestId: context.xRequestId ?? "unknown", feilkode },
      "Paaminnelse API route failed",
    );
    sendErrorResponse(res, 502, feilkode);
  }
};

function sendFeatureDisabledResponse(
  method: AllowedMethod,
  res: NextApiResponse<RouteResponseBody>,
): void {
  if (method === "GET") {
    res.status(200).json(SKJULT_RESPONSE);
    return;
  }

  sendErrorResponse(res, 403, "IKKE_AUTORISERT");
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

  return authorizedSykmeldt.fnr
    ? { orgnummer: authorizedSykmeldt.orgnummer, fnr: authorizedSykmeldt.fnr }
    : { orgnummer: authorizedSykmeldt.orgnummer };
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
  res.status(statusCode).json({ feilkode });
}

export default withAuthenticatedApi(handler);
