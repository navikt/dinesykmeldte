import { logger } from "@navikt/next-logger";
import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "../../../../auth/withAuthenticatedApiRoute";
import {
  BestillPaaminnelseRequestSchema,
  type PaaminnelseFeilResponse,
  type PaaminnelseStatus,
} from "../../../../services/paaminnelse/paaminnelseContract";
import {
  avbestillPaaminnelse,
  bestillPaaminnelse,
  hentPaaminnelseStatus,
  PaaminnelseAdapterError,
} from "../../../../services/paaminnelse/paaminnelseService";

type PaaminnelseRouteContext =
  RouteContext<"/api/paaminnelse/[narmestelederId]">;

type AllowedMethod = "GET" | "POST" | "DELETE";
type RouteResponseBody = PaaminnelseStatus | PaaminnelseFeilResponse;
type RouteFeilkode = PaaminnelseFeilResponse["feilkode"];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handlePaaminnelseRequest(
  req: Request,
  routeContext: PaaminnelseRouteContext,
  method: AllowedMethod,
): Promise<NextResponse<RouteResponseBody>> {
  const context = createAppRouterResolverContextType(req);
  if (!context) {
    logger.error("Missing authenticated context in paaminnelse route");
    return errorResponse(401, "IKKE_AUTORISERT");
  }

  const { narmestelederId } = await routeContext.params;
  if (!narmestelederId) {
    logger.warn(
      { xRequestId: context.xRequestId ?? "unknown" },
      "Invalid parameter in paaminnelse route",
    );
    return errorResponse(400, "UGYLDIG_FORESPORSEL");
  }

  try {
    switch (method) {
      case "GET":
        return NextResponse.json(
          await hentPaaminnelseStatus(narmestelederId, context),
        );
      case "POST": {
        const body = await parseJsonOrUndefined(req);
        if (!BestillPaaminnelseRequestSchema.safeParse(body).success) {
          return errorResponse(400, "UGYLDIG_FORESPORSEL");
        }

        return NextResponse.json(
          await bestillPaaminnelse(narmestelederId, context),
        );
      }
      case "DELETE":
        return NextResponse.json(
          await avbestillPaaminnelse(narmestelederId, context),
        );
      default:
        return errorResponse(400, "UGYLDIG_FORESPORSEL");
    }
  } catch (error: unknown) {
    if (error instanceof PaaminnelseAdapterError) {
      return errorResponse(502, error.feilkode);
    }

    const feilKode = getUnexpectedFeilkode(method);
    logger.error(
      { xRequestId: context.xRequestId ?? "unknown", feilKode },
      "Paaminnelse API failed",
    );
    return errorResponse(502, feilKode);
  }
}

export const GET = withAuthenticatedApiRoute<PaaminnelseRouteContext>(
  async (req, context) => {
    return handlePaaminnelseRequest(req, context, "GET");
  },
);

export const POST = withAuthenticatedApiRoute<PaaminnelseRouteContext>(
  async (req, context) => {
    return handlePaaminnelseRequest(req, context, "POST");
  },
);

export const DELETE = withAuthenticatedApiRoute<PaaminnelseRouteContext>(
  async (req, context) => {
    return handlePaaminnelseRequest(req, context, "DELETE");
  },
);

async function parseJsonOrUndefined<T = unknown>(
  req: Request,
): Promise<T | undefined> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return undefined;
  }

  try {
    return (await req.json()) as T;
  } catch {
    return undefined;
  }
}

function getUnexpectedFeilkode(method: AllowedMethod): RouteFeilkode {
  switch (method) {
    case "GET":
      return "STATUS_FEILET";
    case "POST":
      return "BESTILLING_FEILET";
    case "DELETE":
      return "AVBESTILLING_FEILET";
    default:
      return "UGYLDIG_FORESPORSEL";
  }
}

function errorResponse(
  status: number,
  feilKode: RouteFeilkode,
): NextResponse<PaaminnelseFeilResponse> {
  return NextResponse.json(
    { feilkode: feilKode },
    {
      status,
    },
  );
}
