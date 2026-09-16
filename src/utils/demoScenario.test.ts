import { describe, expect, it } from "vitest";
import {
  DEFAULT_DEMO_SCENARIO,
  DEMO_SCENARIO_COOKIE_NAME,
  demoScenarioFromCookieHeader,
  isDemoScenario,
  parseDemoScenarioCookieValue,
  readDemoScenarioCookieValueFromHeader,
} from "./demoScenario";

describe("isDemoScenario", () => {
  it("recognizes every known scenario", () => {
    expect(isDemoScenario("default")).toBe(true);
    expect(isDemoScenario("tiltakspakke-1")).toBe(true);
  });

  it("rejects unknown, malformed, or non-string values", () => {
    expect(isDemoScenario("nope")).toBe(false);
    expect(isDemoScenario("")).toBe(false);
    expect(isDemoScenario(undefined)).toBe(false);
    expect(isDemoScenario(null)).toBe(false);
    expect(isDemoScenario(1)).toBe(false);
  });
});

describe("parseDemoScenarioCookieValue", () => {
  it("resolves absent values to the default scenario", () => {
    expect(parseDemoScenarioCookieValue(undefined)).toBe(DEFAULT_DEMO_SCENARIO);
    expect(parseDemoScenarioCookieValue(null)).toBe(DEFAULT_DEMO_SCENARIO);
  });

  it("resolves malformed or unknown values to the default scenario", () => {
    expect(parseDemoScenarioCookieValue("")).toBe(DEFAULT_DEMO_SCENARIO);
    expect(parseDemoScenarioCookieValue("nope")).toBe(DEFAULT_DEMO_SCENARIO);
    expect(parseDemoScenarioCookieValue("TILTAKSPAKKE")).toBe(
      DEFAULT_DEMO_SCENARIO,
    );
  });

  it("resolves known scenario values to themselves", () => {
    expect(parseDemoScenarioCookieValue("default")).toBe("default");
    expect(parseDemoScenarioCookieValue("tiltakspakke-1")).toBe(
      "tiltakspakke-1",
    );
  });
});

describe("readDemoScenarioCookieValueFromHeader", () => {
  it("returns undefined when there is no cookie header", () => {
    expect(readDemoScenarioCookieValueFromHeader(undefined)).toBeUndefined();
    expect(readDemoScenarioCookieValueFromHeader(null)).toBeUndefined();
    expect(readDemoScenarioCookieValueFromHeader("")).toBeUndefined();
  });

  it("reads the value when it is the only cookie", () => {
    expect(
      readDemoScenarioCookieValueFromHeader(
        `${DEMO_SCENARIO_COOKIE_NAME}=tiltakspakke-1`,
      ),
    ).toBe("tiltakspakke-1");
  });

  it("reads the value when other cookies surround it, trimming whitespace", () => {
    expect(
      readDemoScenarioCookieValueFromHeader(
        `foo=bar; ${DEMO_SCENARIO_COOKIE_NAME}=tiltakspakke-1; baz=qux`,
      ),
    ).toBe("tiltakspakke-1");
  });

  it("returns undefined when the cookie is not present", () => {
    expect(
      readDemoScenarioCookieValueFromHeader("foo=bar; baz=qux"),
    ).toBeUndefined();
  });

  it("does not match on a substring collision where another cookie name contains ours", () => {
    expect(
      readDemoScenarioCookieValueFromHeader(
        `other-${DEMO_SCENARIO_COOKIE_NAME}-suffix=tiltakspakke-1`,
      ),
    ).toBeUndefined();
  });

  it("does not match on a substring collision where our name is a prefix of another cookie name", () => {
    expect(
      readDemoScenarioCookieValueFromHeader(
        `${DEMO_SCENARIO_COOKIE_NAME}-extra=tiltakspakke-1`,
      ),
    ).toBeUndefined();
  });
});

describe("demoScenarioFromCookieHeader", () => {
  it("resolves to the default scenario when the cookie is absent", () => {
    expect(demoScenarioFromCookieHeader(undefined)).toBe("default");
    expect(demoScenarioFromCookieHeader("foo=bar")).toBe("default");
  });

  it("resolves to the default scenario for a malformed or unknown value", () => {
    expect(
      demoScenarioFromCookieHeader(`${DEMO_SCENARIO_COOKIE_NAME}=nope`),
    ).toBe("default");
  });

  it("resolves to the tiltakspakke-1 scenario when set", () => {
    expect(
      demoScenarioFromCookieHeader(
        `${DEMO_SCENARIO_COOKIE_NAME}=tiltakspakke-1`,
      ),
    ).toBe("tiltakspakke-1");
  });
});
