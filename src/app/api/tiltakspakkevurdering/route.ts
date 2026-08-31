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

async function handler(req: Request): Promise<NextResponse> {
  const context = createAppRouterResolverContextType(req);
  if (!context) {
    logger.warn("Missing authenticated context in tiltakspakkevurdering route");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    return NextResponse.json(await getTiltakspakkevurderinger(context), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    logger.error(
      runtimeErrorContext(
        RuntimeErrorEvent.TILTAKSPAKKEVURDERING_LOOKUP_FAILED,
        RuntimeErrorCode.UNEXPECTED_ERROR,
      ),
      "Tiltakspakkevurdering API failed closed to an empty vurderinger-array",
    );

    return NextResponse.json(createEmptyTiltakspakkevurderinger(), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

const authenticatedHandler = withAuthenticatedApiRoute(handler);

export { authenticatedHandler as GET };
