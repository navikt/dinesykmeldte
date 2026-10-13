import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "../../../auth/withAuthenticatedApiRoute";
import {
  type FailureStage,
  logServerFailure,
} from "../../../observability/serverLog";
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
    logServerFailure("missingAuthenticatedContext", undefined, {
      failure_stage: "authentication",
      outcome: "rejected",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { LUMI_API_SCOPE, LUMI_API_HOST } = getServerEnv();

  let failureStage: FailureStage = "token_exchange";
  try {
    const oboResult = await requestOboToken(
      resolverContextType.accessToken,
      LUMI_API_SCOPE,
    );
    if (!oboResult.ok) {
      logServerFailure("lumiFeedbackFailed", oboResult.error, {
        upstream: "lumi-api",
        failure_stage: "token_exchange",
      });
      return NextResponse.json(
        { error: "Failed to exchange token for Lumi API" },
        { status: 502 },
      );
    }
    failureStage = "request";
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
      logServerFailure("lumiFeedbackFailed", undefined, {
        upstream: "lumi-api",
        failure_kind: "http",
        failure_stage: "response",
        upstream_status: lumiResponse.status,
        error_code: "UPSTREAM_HTTP_ERROR",
      });

      return NextResponse.json(
        { error: "Lumi API returned an error" },
        { status: 502 },
      );
    }

    failureStage = "response_parse";
    const responseData = await lumiResponse.json();

    return NextResponse.json(responseData);
  } catch (error) {
    logServerFailure("lumiFeedbackFailed", error, {
      upstream: "lumi-api",
      failure_stage: failureStage,
      ...(failureStage === "response_parse"
        ? {
            failure_kind: "invalid_response",
            error_code: "UPSTREAM_RESPONSE_PARSE_ERROR",
          }
        : {}),
    });

    return NextResponse.json(
      { error: "Error while sending feedback to Lumi API" },
      { status: 502 },
    );
  }
}

const authenticatedHandler = withAuthenticatedApiRoute(handler);

export { authenticatedHandler as POST };
