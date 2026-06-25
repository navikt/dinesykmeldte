import { logger } from "@navikt/next-logger";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createResolverContextType,
  withAuthenticatedApi,
} from "../../../auth/withAuthentication";
import {
  createEmptyOppfolgingsplanTiltakspakkeGateMap,
  type OppfolgingsplanTiltakspakkeGateMap,
} from "../../../services/tiltakspakke/oppfolgingsplanTiltakspakkeContract";
import { getOppfolgingsplanTiltakspakkeGateMap } from "../../../services/tiltakspakke/oppfolgingsplanTiltakspakkeService";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<OppfolgingsplanTiltakspakkeGateMap | { error: string }>,
): Promise<void> => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const context = createResolverContextType(req);
  if (!context) {
    logger.error("Missing authenticated context in tiltakspakke API");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const gateMap = await getOppfolgingsplanTiltakspakkeGateMap(context);
    res.status(200).json(gateMap);
  } catch {
    logger.error(
      {
        xRequestId: context.xRequestId ?? "unknown",
        feilkode: "TILTAKSPAKKE_GATE_MAP_FEILET",
      },
      "Tiltakspakke API failed closed to an empty gate-map",
    );
    res.status(200).json(createEmptyOppfolgingsplanTiltakspakkeGateMap());
  }
};

export default withAuthenticatedApi(handler);
