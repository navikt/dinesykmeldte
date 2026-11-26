import { browserEnv } from "../../utils/env";
import {
  type Tiltakspakkevurderinger,
  TiltakspakkevurderingerSchema,
} from "./tiltakspakkevurderingContract";

const BASE_PATH = browserEnv.publicPath ?? "";

export async function fetchTiltakspakkevurderinger(
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
