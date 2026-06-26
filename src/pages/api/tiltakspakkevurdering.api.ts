import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createResolverContextType,
  withAuthenticatedApi,
} from "../../auth/withAuthentication";
import {
  createEmptyTiltakspakkevurderinger,
  type Tiltakspakkevurderinger,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { getTiltakspakkevurderinger } from "../../services/tiltakspakke/tiltakspakkevurderingService";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Tiltakspakkevurderinger | { error: string }>,
): Promise<void> => {
  // Responsen kan inneholde bruker-/lederkontekstuelle data, og skal aldri caches.
  res.setHeader("Cache-Control", "no-store");

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
    const vurderinger = await getTiltakspakkevurderinger(context);
    res.status(200).json(vurderinger);
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "TILTAKSPAKKEVURDERING_FEILET",
      },
      "Tiltakspakkevurdering API failed closed to an empty vurderinger-array",
    );
    res.status(200).json(createEmptyTiltakspakkevurderinger());
  }
};

export default withAuthenticatedApi(handler);
