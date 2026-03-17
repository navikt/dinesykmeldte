import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createResolverContextType,
  withAuthenticatedApi,
} from "../../auth/withAuthentication";
import { getServerEnv, isLocalOrDemo } from "../../utils/env";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (isLocalOrDemo) {
    logger.info(
      "Running locally or in demo, returning mock lumi feedback response",
    );
    res.status(200).json({ id: "mock-feedback-id" });
    return;
  }

  const resolverContextType = createResolverContextType(req);
  if (!resolverContextType) {
    logger.error("User not logged in during lumi-feedback submission");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { LUMI_API_SCOPE, LUMI_API_HOST } = getServerEnv();

  const oboResult = await requestOboToken(
    resolverContextType.accessToken,
    LUMI_API_SCOPE,
  );
  if (!oboResult.ok) {
    logger.error(
      `Unable to exchange token for Lumi API, reason: ${oboResult.error.message}`,
    );
    res.status(502).json({ error: "Failed to exchange token for Lumi API" });
    return;
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
      body: JSON.stringify(req.body),
    });

    if (!lumiResponse.ok) {
      logger.error(
        `Lumi API responded with ${lumiResponse.status} ${lumiResponse.statusText}`,
      );
      res.status(502).json({ error: "Failed to submit feedback to Lumi API" });
      return;
    }

    const responseData = await lumiResponse.json();

    logger.info("Successfully submitted feedback to Lumi API");
    res.status(200).json(responseData);
  } catch (error: unknown) {
    logger.error(
      `Failed to forward feedback to Lumi API: ${error instanceof Error ? error.message : String(error)}`,
    );
    res.status(502).json({ error: "Failed to communicate with Lumi API" });
  }
};

export default withAuthenticatedApi(handler);
