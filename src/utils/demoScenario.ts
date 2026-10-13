export const DEMO_SCENARIO_COOKIE_NAME = "demo-scenario";
export const DEMO_SCENARIOS = ["default", "tiltakspakke-1"] as const;
export type DemoScenario = (typeof DEMO_SCENARIOS)[number];

/** Unknown/malformed/missing cookie values resolve to this scenario. */
export const DEFAULT_DEMO_SCENARIO: DemoScenario = "default";

export function isDemoScenario(value: unknown): value is DemoScenario {
  return (
    typeof value === "string" &&
    (DEMO_SCENARIOS as readonly string[]).includes(value)
  );
}

export function parseDemoScenarioCookieValue(
  rawValue: string | undefined | null,
): DemoScenario {
  return isDemoScenario(rawValue) ? rawValue : DEFAULT_DEMO_SCENARIO;
}

export function readDemoScenarioCookieValueFromHeader(
  cookieHeader: string | null | undefined,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const pair of cookieHeader.split(";")) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const name = pair.slice(0, separatorIndex).trim();
    if (name === DEMO_SCENARIO_COOKIE_NAME) {
      return pair.slice(separatorIndex + 1).trim();
    }
  }

  return undefined;
}

/**
 * Convenience for Route Handlers: reads the raw `Cookie` request header and
 * resolves it straight to the interpreted DemoScenario.
 */
export function demoScenarioFromCookieHeader(
  cookieHeader: string | null | undefined,
): DemoScenario {
  return parseDemoScenarioCookieValue(
    readDemoScenarioCookieValueFromHeader(cookieHeader),
  );
}
