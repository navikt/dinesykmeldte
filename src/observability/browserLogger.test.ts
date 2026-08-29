import { beforeEach, describe, expect, it, vi } from "vitest";
import { forwardBrowserLogToApm } from "./browserLogger";

const { captureMessage, isInitialized } = vi.hoisted(() => ({
  captureMessage: vi.fn(),
  isInitialized: vi.fn(() => true),
}));

vi.mock("@nais/apm", () => ({
  captureMessage,
  isInitialized,
  scrubString: (value: string) => value,
}));

const logEvent = (level: string, messages: unknown[]) => ({
  ts: Date.now(),
  bindings: [],
  level: { label: level, value: 30 },
  messages,
});

describe("forwardBrowserLogToApm", () => {
  beforeEach(() => {
    isInitialized.mockReturnValue(true);
  });

  it.each([
    ["trace", "debug"],
    ["debug", "debug"],
    ["info", "info"],
    ["warn", "warning"],
  ])("videresender %s som %s", (pinoLevel, severity) => {
    forwardBrowserLogToApm(
      logEvent(pinoLevel, [
        "GET /arbeidsgiver/sykmeldte/api/paaminnelse/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?token=hemmelig",
      ]),
    );

    expect(captureMessage).toHaveBeenCalledWith(
      "GET /arbeidsgiver/sykmeldte/api/paaminnelse/{narmestelederId}",
      severity,
    );
  });

  it.each([
    "error",
    "fatal",
  ])("lar %s gå bare til backendloggen for å unngå dobbel browserfangst", (level) => {
    forwardBrowserLogToApm(logEvent(level, ["feil"]));

    expect(captureMessage).not.toHaveBeenCalled();
  });

  it("sender ingenting før APM er initialisert", () => {
    isInitialized.mockReturnValue(false);

    forwardBrowserLogToApm(logEvent("info", ["tidlig logg"]));

    expect(captureMessage).not.toHaveBeenCalled();
  });

  it.each([
    "ftp://leder:hemmelig@host/sak/ola-nordmann?bedrift=975289753",
    "tel:+4712345678",
    "urn:person:ola-nordmann",
    "url=//host/sak/ola?bedrift=975289753",
    "url=/sak/ola?bedrift=975289753",
    "x=[//host/sak/ola?bedrift=975289753]",
    "x={/sak/ola?bedrift=975289753}",
    "x=,./sak/ola?bedrift=975289753",
    "x=;../sak/ola?bedrift=975289753",
    "x=>?bedrift=975289753",
    "x=!#leder-ola-nordmann",
    "x=|/sak/ola?bedrift=975289753",
    "path:/sak/ola?bedrift=975289753",
    "query:?bedrift=975289753",
    "fragment:#leder-ola-nordmann",
    "http:ola-nordmann?bedrift=975289753",
    "https:///ola-nordmann?bedrift=975289753",
    "///ola-nordmann/sak?bedrift=975289753",
    "https://\\ola-nordmann/sak?bedrift=975289753",
  ])("fjerner detaljer fra URL-referansen %s", (url) => {
    forwardBrowserLogToApm(logEvent("warn", [url]));

    expect(captureMessage).toHaveBeenCalledOnce();
    expect(captureMessage.mock.calls[0]?.[0]).not.toMatch(
      /hemmelig|ola|975289753|12345678/,
    );
  });
});
