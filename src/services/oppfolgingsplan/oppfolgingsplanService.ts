import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import { z } from "zod";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getServerEnv } from "../../utils/env";

const personSchema = z.object({
  pilotUser: z.boolean(),
});

export async function getPilotUserStatus(
  fnr: string,
  context: ResolverContextType,
): Promise<boolean> {
  try {
    const oboResult = await requestOboToken(
      context.accessToken,
      getServerEnv().OPPFOLGINGSPLAN_BACKEND_SCOPE,
    );
    if (!oboResult.ok) {
      logger.warn(
        new Error(
          `Unable to exchange token for oppfolgingsplan-backend token, reason: ${oboResult.error.message}`,
          { cause: oboResult.error },
        ),
      );
      return false;
    }

    const response = await fetch(
      `${getServerEnv().OPPFOLGINGSPLAN_BACKEND_URL}/api/v1/person`,
      {
        method: "GET",
        headers: {
          "x-request-id": context.xRequestId ?? "unknown",
          Authorization: `Bearer ${oboResult.token}`,
          "nav-personident": fnr,
        },
      },
    );

    if (!response.ok) {
      logger.warn(
        new Error(
          `Unknown error from oppfolgingsplan-backend, responded with ${response.status} ${response.statusText} when fetching pilot status`,
        ),
      );
      return false;
    }

    const responseJson: unknown = await response.json();
    const parsed = personSchema.safeParse(responseJson);
    if (!parsed.success) {
      logger.warn(
        new Error(
          `Unable to parse oppfolgingsplan-backend person response, parse error: ${parsed.error.message}`,
        ),
      );
      return false;
    }

    return parsed.data.pilotUser;
  } catch (error) {
    logger.warn(
      new Error("Pilot user lookup failed, defaulting to non-pilot", {
        cause: error,
      }),
    );
    return false;
  }
}
