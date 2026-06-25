import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createResolverContextType,
  withAuthenticatedApi,
} from "../../auth/withAuthentication";
import {
  createEmptyTiltakspakkevurderingMap,
  type TiltakspakkevurderingMap,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { getTiltakspakkevurderingMap } from "../../services/tiltakspakke/tiltakspakkevurderingService";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<TiltakspakkevurderingMap | { error: string }>,
): Promise<void> => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const context = createResolverContextType(req);
  if (!context) {
    logger.error("Missing authenticated context in tiltakspakkevurdering API");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const vurderingMap = await getTiltakspakkevurderingMap(context);
    res.status(200).json(vurderingMap);
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "TILTAKSPAKKEVURDERING_FEILET",
      },
      "Tiltakspakkevurdering API failed closed to an empty vurdering-map",
    );
    res.status(200).json(createEmptyTiltakspakkevurderingMap());
  }
};

export default withAuthenticatedApi(handler);
