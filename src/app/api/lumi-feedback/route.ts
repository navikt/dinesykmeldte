import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "../../../auth/withAuthenticatedApiRoute";
import { getServerEnv, isLocalOrDemo } from "../../../utils/env";

async function handler(req: Request): Promise<NextResponse> {
  if (isLocalOrDemo) {
    logger.info(
      "Running locally or in demo, returning mock lumi feedback response",
    );
    return NextResponse.json({ id: "mock-feedback-id" });
  }

  const resolverContextType = createAppRouterResolverContextType(req);
  if (!resolverContextType) {
    logger.error("User not logged in during lumi-feedback submission");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { LUMI_API_SCOPE, LUMI_API_HOST } = getServerEnv();

  const oboResult = await requestOboToken(
    resolverContextType.accessToken,
    LUMI_API_SCOPE,
  );
  if (!oboResult.ok) {
    logger.error(
      { reason: oboResult.error.message },
      "Unable to exchange token for Lumi API",
    );

    return NextResponse.json(
      { error: "Failed to exchange token for Lumi API" },
      { status: 502 },
    );
  }

  try {
    const url = new URL("/api/tokenx/v1/feedback", LUMI_API_HOST);

    const lumiResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboResult.token}`,
        "Content-Type": "application/json",
        "x-request-id": resolverContextType.xRequestId ?? "unknown",
      },
      body: JSON.stringify(await req.json()),
    });

    if (!lumiResponse.ok) {
      logger.error(
        { status: lumiResponse.status, statusText: lumiResponse.statusText },
        "Lumi API returned an error",
      );

      return NextResponse.json(
        { error: "Lumi API returned an error" },
        { status: 502 },
      );
    }

    const responseData = await lumiResponse.json();

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error({ error }, "Error while sending feedback to Lumi API");

    return NextResponse.json(
      { error: "Error while sending feedback to Lumi API" },
      { status: 502 },
    );
  }
}

const authenticatedHandler = withAuthenticatedApiRoute(handler);

export { authenticatedHandler as POST };
