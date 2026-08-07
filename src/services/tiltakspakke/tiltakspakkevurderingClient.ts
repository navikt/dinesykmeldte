import { browserEnv } from "../../utils/env";
import {
  type Tiltakspakkevurderinger,
  TiltakspakkevurderingerSchema,
} from "./tiltakspakkevurderingContract";

const BASE_PATH = browserEnv.publicPath ?? "";

/**
 * Klientside-adapter mot tiltakspakkevurdering-BFF-en. Prefikser med basePath og
 * validerer svaret mot delt zod-kontrakt før gating-logikken bruker det.
 */
export async function hentTiltakspakkevurderinger(
  signal: AbortSignal,
): Promise<Tiltakspakkevurderinger> {
  const response = await fetch(`${BASE_PATH}/api/tiltakspakkevurdering`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw new Error("Tiltakspakkevurdering-kall feilet");
  }

  return TiltakspakkevurderingerSchema.parse(await response.json());
}
