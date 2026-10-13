import { requestOboToken } from "@navikt/oasis";
import { getServerEnv } from "../../utils/env";
import {
  type FlaggskipetTiltakspakkevurderinger,
  FlaggskipetTiltakspakkevurderingerSchema,
} from "./flaggskipetContract";

const FLAGGSKIPET_FETCH_TIMEOUT_MS = 3000;
const FLAGGSKIPET_VURDERING_PATH = "/api/v1/tiltakspakker/vurdering";

export async function fetchTiltakspakkevurderinger(
  autoriserteOrgnumre: ReadonlyArray<string>,
  accessToken: string,
): Promise<FlaggskipetTiltakspakkevurderinger> {
  const oboResult = await requestOboToken(
    accessToken,
    getServerEnv().FLAGGSKIPET_SCOPE,
  ).catch((cause: unknown) => {
    throw Object.assign(
      new Error("Flaggskipet token exchange failed", { cause }),
      { failure_stage: "token_exchange" },
    );
  });
  if (!oboResult.ok) {
    throw Object.assign(
      new Error("Flaggskipet token exchange failed", {
        cause: oboResult.error,
      }),
      { failure_stage: "token_exchange" },
    );
  }

  const response = await fetchWithTimeout(
    `${getServerEnv().FLAGGSKIPET_URL}${FLAGGSKIPET_VURDERING_PATH}`,
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
    throw Object.assign(new Error("Flaggskipet request failed"), {
      upstream_status: response.status,
      failure_stage: "response",
    });
  }

  const result = FlaggskipetTiltakspakkevurderingerSchema.safeParse(
    await response.json().catch((cause: unknown) => {
      throw Object.assign(
        new Error("Invalid JSON from Flaggskipet", { cause }),
        { upstream_status: response.status, failure_stage: "response_parse" },
      );
    }),
  );

  if (!result.success) {
    throw Object.assign(
      new Error("Flaggskipet response did not match expected schema", {
        cause: result.error,
      }),
      {
        upstream_status: response.status,
        failure_stage: "response_validation",
      },
    );
  }

  return result.data;
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
  } catch (cause) {
    if (controller.signal.aborted)
      throw Object.assign(
        new Error("Flaggskipet request timed out", { cause }),
        { code: "ETIMEDOUT" },
      );
    throw cause;
  } finally {
    clearTimeout(timeoutId);
  }
}
