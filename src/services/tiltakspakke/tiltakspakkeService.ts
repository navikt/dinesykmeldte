import { logger } from "@navikt/next-logger";
import { requestOboToken } from "@navikt/oasis";
import type { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import { getTiltakspakkeConfig } from "../../utils/env";
import {
  TILTAKSPAKKE_ID,
  type TiltakspakkeStatus,
  TiltakspakkeVurderingResponseSchema,
} from "./schema/tiltakspakke";

const EXTERNAL_FETCH_TIMEOUT_MS = 3000;

export async function getTiltakspakkeStatus(
  orgnummer: string,
  context: ResolverContextType,
): Promise<TiltakspakkeStatus> {
  const config = getTiltakspakkeConfig();
  if (config == null) {
    return "UKJENT";
  }

  try {
    const oboResult = await requestOboToken(context.accessToken, config.scope);
    if (!oboResult.ok) {
      logFailClosed(context, "token exchange");
      return "UKJENT";
    }

    const response = await fetchWithTimeout(
      getTiltakspakkeVurderingUrl(config.url, orgnummer),
      {
        method: "GET",
        headers: {
          "x-request-id": context.xRequestId ?? "unknown",
          Authorization: `Bearer ${oboResult.token}`,
        },
      },
    );

    if (!response.ok) {
      logFailClosed(context, "non-2xx response");
      return "UKJENT";
    }

    const parsedResponse = TiltakspakkeVurderingResponseSchema.safeParse(
      await response.json(),
    );
    if (!parsedResponse.success) {
      logFailClosed(context, "invalid response body");
      return "UKJENT";
    }

    return parsedResponse.data.status;
  } catch {
    logFailClosed(context, "request failure");
    return "UKJENT";
  }
}

function getTiltakspakkeVurderingUrl(
  baseUrl: string,
  orgnummer: string,
): string {
  const url = new URL(
    `/api/tiltakspakker/${TILTAKSPAKKE_ID}/vurdering`,
    baseUrl,
  );
  url.searchParams.set("orgnummer", orgnummer);

  return url.toString();
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    EXTERNAL_FETCH_TIMEOUT_MS,
  );

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function logFailClosed(
  context: Pick<ResolverContextType, "xRequestId">,
  reason: string,
): void {
  logger.warn(
    { xRequestId: context.xRequestId ?? "unknown" },
    `Tiltakspakke adapter failed closed (${reason})`,
  );
}
