import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "../../../auth/withAuthenticatedApiRoute";
import { RuntimeErrorCode } from "../../../observability/runtimeErrorContract";
import {
  failureDiagnostics,
  logServerFailure,
} from "../../../observability/serverLog";
import { createEmptyTiltakspakkevurderinger } from "../../../services/tiltakspakke/tiltakspakkevurderingContract";
import { getTiltakspakkevurderinger } from "../../../services/tiltakspakke/tiltakspakkevurderingService";
import { demoScenarioFromCookieHeader } from "../../../utils/demoScenario";

async function handler(req: Request): Promise<NextResponse> {
  const context = createAppRouterResolverContextType(req);
  if (!context) {
    logServerFailure("missingAuthenticatedContext", undefined, {
      failure_stage: "authentication",
      outcome: "rejected",
    });
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
  } catch (error) {
    logServerFailure("tiltakspakkeLookupFailed", error, {
      cause_code: failureDiagnostics(error).error_code,
      error_code: RuntimeErrorCode.UNEXPECTED_ERROR,
      outcome: "degraded",
    });

    return NextResponse.json(createEmptyTiltakspakkevurderinger(), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

const authenticatedHandler = withAuthenticatedApiRoute(handler);

export { authenticatedHandler as GET };
