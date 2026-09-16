import { logger } from "@navikt/next-logger";
import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "../../../auth/withAuthenticatedApiRoute";
import {
  RuntimeErrorCode,
  RuntimeErrorEvent,
  runtimeErrorContext,
} from "../../../observability/runtimeErrorContract";
import { createEmptyTiltakspakkevurderinger } from "../../../services/tiltakspakke/tiltakspakkevurderingContract";
import { getTiltakspakkevurderinger } from "../../../services/tiltakspakke/tiltakspakkevurderingService";
import { demoScenarioFromCookieHeader } from "../../../utils/demoScenario";

async function handler(req: Request): Promise<NextResponse> {
  const context = createAppRouterResolverContextType(req);
  if (!context) {
    logger.warn("Missing authenticated context in tiltakspakkevurdering route");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Only consulted by the service in local/demo; ignored everywhere else.
  const demoScenario = demoScenarioFromCookieHeader(req.headers.get("cookie"));

  try {
    return NextResponse.json(
      await getTiltakspakkevurderinger(context, { demoScenario }),
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    logger.error(
      runtimeErrorContext(
        RuntimeErrorEvent.TILTAKSPAKKEVURDERING_LOOKUP_FAILED,
        RuntimeErrorCode.UNEXPECTED_ERROR,
      ),
      "Kunne ikke hente tiltakspakkevurdering; returnerer tom liste",
    );

    return NextResponse.json(createEmptyTiltakspakkevurderinger(), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

const authenticatedHandler = withAuthenticatedApiRoute(handler);

export { authenticatedHandler as GET };
