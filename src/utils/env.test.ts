import { afterEach, describe, expect, it, vi } from "vitest";
import { isStegoversiktFeatureToggleEnabled } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isStegoversiktFeatureToggleEnabled", () => {
  it("er av når togglen mangler", () => {
    vi.stubEnv("STEGOVERSIKT_TILTAKSPAKKE_2_FEATURE_TOGGLE", undefined);
    expect(isStegoversiktFeatureToggleEnabled()).toBe(false);
  });

  it("er på når togglen er «true»", () => {
    vi.stubEnv("STEGOVERSIKT_TILTAKSPAKKE_2_FEATURE_TOGGLE", "true");
    expect(isStegoversiktFeatureToggleEnabled()).toBe(true);
  });

  it("er av ved ugyldig verdi", () => {
    vi.stubEnv("STEGOVERSIKT_TILTAKSPAKKE_2_FEATURE_TOGGLE", "ja");
    expect(isStegoversiktFeatureToggleEnabled()).toBe(false);
  });

  it("kaster ikke når andre server-env-er mangler, slik som i demo", () => {
    vi.stubEnv("STEGOVERSIKT_TILTAKSPAKKE_2_FEATURE_TOGGLE", "true");
    vi.stubEnv("FLAGGSKIPET_SCOPE", undefined);
    vi.stubEnv("FLAGGSKIPET_URL", undefined);
    vi.stubEnv("TOKEN_X_PRIVATE_JWK", undefined);
    expect(isStegoversiktFeatureToggleEnabled()).toBe(true);
  });
});
