import { logger } from "@navikt/next-logger";
import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedAppRoute,
} from "../../../auth/withAuthenticatedAppRoute";
import { createEmptyTiltakspakkevurderinger } from "../../../services/tiltakspakke/tiltakspakkevurderingContract";
import { getTiltakspakkevurderinger } from "../../../services/tiltakspakke/tiltakspakkevurderingService";

async function handler(req: Request): Promise<NextResponse> {
  const context = createAppRouterResolverContextType(req);
  if (!context) {
    logger.error(
      "Missing authenticated context in tiltakspakkevurdering route",
    );
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
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "TILTAKSPAKKEVURDERING_FEILET",
      },
      "Tiltakspakkevurdering API failed closed to an empty vurderinger-array",
    );

    return NextResponse.json(createEmptyTiltakspakkevurderinger(), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

const authenticatedHandler = withAuthenticatedAppRoute(handler);

export { authenticatedHandler as GET };
