import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type AidStegoversiktEvent,
  recordAidStegoversikt,
} from "./aidTelemetry";

const { pushEvent, getBrowserObservability } = vi.hoisted(() => ({
  pushEvent: vi.fn(),
  getBrowserObservability: vi.fn(),
}));
vi.mock("./browser", () => ({ getBrowserObservability }));

const stegoversiktEvent: AidStegoversiktEvent = {
  schema_version: "1",
  flate: "stegoversikt",
  tiltakspakke: "2",
  gruppe: "tiltak",
  hendelse: "fane_valgt",
  fane: "dialogmote_1",
};
beforeEach(() => {
  pushEvent.mockReset();
  getBrowserObservability.mockReturnValue({ api: { pushEvent } });
});

describe("AID product event boundary", () => {
  it("sends closed step-overview categories without identifiers", () => {
    recordAidStegoversikt({
      ...stegoversiktEvent,
      orgnummer: "synthetic-org",
      fnr: "synthetic-fnr",
      person: "Test Testesen",
    } as AidStegoversiktEvent);

    expect(pushEvent).toHaveBeenCalledExactlyOnceWith(
      "aid_stegoversikt",
      {
        ...stegoversiktEvent,
        gruppe: "tiltak",
      },
      "aid",
      { skipDedupe: true },
    );
  });

  it("rejects arbitrary step and link values", () => {
    recordAidStegoversikt({
      ...stegoversiktEvent,
      fane: "synthetic-fnr",
    } as unknown as AidStegoversiktEvent);
    recordAidStegoversikt({
      ...stegoversiktEvent,
      hendelse: "lenke_klikket",
      lenke: "person@example.no",
    } as unknown as AidStegoversiktEvent);

    expect(pushEvent).not.toHaveBeenCalled();
  });

  it("does not throw when APM is absent or not ready", () => {
    getBrowserObservability.mockReturnValue(undefined);
    expect(() => recordAidStegoversikt(stegoversiktEvent)).not.toThrow();
    getBrowserObservability.mockImplementation(() => {
      throw new Error("not ready");
    });
    expect(() => recordAidStegoversikt(stegoversiktEvent)).not.toThrow();
  });

  it("does not throw when step-overview delivery fails", () => {
    pushEvent.mockImplementation(() => {
      throw new Error("faro down");
    });
    expect(() => recordAidStegoversikt(stegoversiktEvent)).not.toThrow();
  });

  it("preserves repeated step-overview events without deduping", () => {
    recordAidStegoversikt(stegoversiktEvent);
    recordAidStegoversikt(stegoversiktEvent);

    expect(pushEvent).toHaveBeenCalledTimes(2);
    expect(pushEvent.mock.calls.every((call) => call[3].skipDedupe)).toBe(true);
  });
});
