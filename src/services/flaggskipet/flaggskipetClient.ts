import { requestOboToken } from "@navikt/oasis";
import { getServerEnv } from "../../utils/env";
import {
  type FlaggskipetTiltakspakkevurderinger,
  FlaggskipetTiltakspakkevurderingerSchema,
} from "./flaggskipetContract";

const FLAGGSKIPET_FETCH_TIMEOUT_MS = 3000;
const TILTAKSPAKKER_VURDERING_PATH = "/api/v1/tiltakspakker/vurdering";

export async function fetchTiltakspakkevurderinger(
  autoriserteOrgnumre: ReadonlyArray<string>,
  accessToken: string,
): Promise<FlaggskipetTiltakspakkevurderinger> {
  const oboResult = await requestOboToken(
    accessToken,
    getServerEnv().FLAGGSKIPET_SCOPE,
  );
  if (!oboResult.ok) {
    throw new Error(
      `Unable to exchange token for Flaggskipet, reason: ${oboResult.error.message}`,
      { cause: oboResult.error },
    );
  }

  const response = await fetchWithTimeout(
    `${getServerEnv().FLAGGSKIPET_URL}${TILTAKSPAKKER_VURDERING_PATH}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oboResult.token}`,
      },
      body: JSON.stringify({ orgnumre: autoriserteOrgnumre }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Flaggskipet responded with [${response.status} ${response.statusText}]`,
    );
  }

  return FlaggskipetTiltakspakkevurderingerSchema.parse(await response.json());
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    FLAGGSKIPET_FETCH_TIMEOUT_MS,
  );

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
