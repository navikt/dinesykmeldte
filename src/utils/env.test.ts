import { afterEach, describe, expect, it } from "vitest";
import {
  getPaaminnelseConfig,
  getServerEnv,
  getTiltakspakkeConfig,
  isPaaminnelseFeatureToggleEnabled,
} from "./env";

const optionalEnvKeys = [
  "TILTAKSPAKKE_API_URL",
  "TILTAKSPAKKE_API_SCOPE",
  "OPPFOLGINGSPLAN_BACKEND_URL",
  "OPPFOLGINGSPLAN_BACKEND_SCOPE",
  "PAAMINNELSE_FEATURE_TOGGLE",
] as const;

const originalOptionalEnv = {
  TILTAKSPAKKE_API_URL: process.env.TILTAKSPAKKE_API_URL,
  TILTAKSPAKKE_API_SCOPE: process.env.TILTAKSPAKKE_API_SCOPE,
  OPPFOLGINGSPLAN_BACKEND_URL: process.env.OPPFOLGINGSPLAN_BACKEND_URL,
  OPPFOLGINGSPLAN_BACKEND_SCOPE: process.env.OPPFOLGINGSPLAN_BACKEND_SCOPE,
  PAAMINNELSE_FEATURE_TOGGLE: process.env.PAAMINNELSE_FEATURE_TOGGLE,
};

const clearEnv = (...keys: (typeof optionalEnvKeys)[number][]) => {
  for (const key of keys) {
    delete process.env[key];
  }
};

describe("isPaaminnelseFeatureToggleEnabled", () => {
  it("returns false when toggle is missing", () => {
    clearEnv("PAAMINNELSE_FEATURE_TOGGLE");

    expect(isPaaminnelseFeatureToggleEnabled()).toBe(false);
  });

  it("returns false unless toggle is exactly true", () => {
    process.env.PAAMINNELSE_FEATURE_TOGGLE = "false";

    expect(isPaaminnelseFeatureToggleEnabled()).toBe(false);
  });

  it("returns true when toggle is true", () => {
    process.env.PAAMINNELSE_FEATURE_TOGGLE = "true";

    expect(isPaaminnelseFeatureToggleEnabled()).toBe(true);
  });

  it("returns false in prod even when toggle is true", () => {
    process.env.PAAMINNELSE_FEATURE_TOGGLE = "true";

    expect(isPaaminnelseFeatureToggleEnabled("prod")).toBe(false);
  });

  it("returns true in dev when toggle is true", () => {
    process.env.PAAMINNELSE_FEATURE_TOGGLE = "true";

    expect(isPaaminnelseFeatureToggleEnabled("dev")).toBe(true);
  });
});

afterEach(() => {
  for (const key of optionalEnvKeys) {
    const value = originalOptionalEnv[key];

    if (value === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }
});

describe("getServerEnv", () => {
  it("does not require the optional adapter envs", () => {
    clearEnv(...optionalEnvKeys);

    expect(getServerEnv().DINE_SYKMELDTE_BACKEND_URL).toBe("http://localhost");
  });
});

const adapterConfigCases = [
  {
    name: "getTiltakspakkeConfig",
    getConfig: getTiltakspakkeConfig,
    urlKey: "TILTAKSPAKKE_API_URL",
    scopeKey: "TILTAKSPAKKE_API_SCOPE",
    expected: {
      url: "https://tiltakspakke.example.no",
      scope: "api://tiltakspakke/.default",
    },
  },
  {
    name: "getPaaminnelseConfig",
    getConfig: getPaaminnelseConfig,
    urlKey: "OPPFOLGINGSPLAN_BACKEND_URL",
    scopeKey: "OPPFOLGINGSPLAN_BACKEND_SCOPE",
    expected: {
      url: "https://oppfolgingsplan.example.no",
      scope: "api://oppfolgingsplan/.default",
    },
  },
] as const;

for (const {
  name,
  getConfig,
  urlKey,
  scopeKey,
  expected,
} of adapterConfigCases) {
  describe(name, () => {
    it("returns null when both envs are missing", () => {
      clearEnv(urlKey, scopeKey);

      expect(getConfig()).toBeNull();
    });

    it("returns null when only the url env is set", () => {
      clearEnv(urlKey, scopeKey);
      process.env[urlKey] = expected.url;

      expect(getConfig()).toBeNull();
    });

    it("returns null when only the scope env is set", () => {
      clearEnv(urlKey, scopeKey);
      process.env[scopeKey] = expected.scope;

      expect(getConfig()).toBeNull();
    });

    it("returns null when one env is an empty string", () => {
      clearEnv(urlKey, scopeKey);
      process.env[urlKey] = "";
      process.env[scopeKey] = expected.scope;

      expect(getConfig()).toBeNull();
    });

    it("returns config when both envs are set", () => {
      process.env[urlKey] = expected.url;
      process.env[scopeKey] = expected.scope;

      expect(getConfig()).toEqual(expected);
    });
  });
}
