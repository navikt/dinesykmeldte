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
    res.status(200).json({ id: "mock-feedback-id" });
    return;
  }

  const resolverContextType = createResolverContextType(req);
  if (!resolverContextType) {
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
    const body = await lumiResponse.text();
    logger.error(`Lumi API error (${lumiResponse.status}): ${body}`);
    res.status(502).json({ error: "Failed to submit feedback to Lumi API" });
    return;
  }

  const data = await lumiResponse.json();
  res.status(200).json(data);
};

export default withAuthenticatedApi(handler);
