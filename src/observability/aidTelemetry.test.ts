import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type AidPaaminnelseEvent,
  type AidStegoversiktEvent,
  recordAidPaaminnelse,
  recordAidStegoversikt,
} from "./aidTelemetry";

const { pushEvent, getBrowserObservability } = vi.hoisted(() => ({
  pushEvent: vi.fn(),
  getBrowserObservability: vi.fn(),
}));
vi.mock("./browser", () => ({ getBrowserObservability }));

const event: AidPaaminnelseEvent = {
  gruppe: "tiltak",
  variant: "aid",
  hendelse: "bestill",
  paaminnelsevalg: "ikke_bestilt",
  utfall: "bekreftet",
};
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
  it("sends only closed categories through the existing APM instance", () => {
    recordAidPaaminnelse({
      ...event,
      orgnummer: "999888777",
      person: "Test Testesen",
      fnr: "12345678901",
      planId: "secret-id",
      url: "/person/123",
    } as AidPaaminnelseEvent);
    expect(pushEvent).toHaveBeenCalledExactlyOnceWith(
      "aid_paaminnelse",
      {
        ...event,
        tiltakspakke: "OPPFOLGINGSPLAN_TILTAKSPAKKE_1",
        flate: "dinesykmeldte",
        schema_version: "1",
      },
      "aid",
      { skipDedupe: true },
    );
  });
  it.each([
    "gruppe",
    "variant",
    "hendelse",
    "paaminnelsevalg",
    "utfall",
  ])("rejects arbitrary values in %s instead of logging them", (field) => {
    recordAidPaaminnelse({ ...event, [field]: "person@example.no" });
    expect(pushEvent).not.toHaveBeenCalled();
  });
  it("does not collapse separate actions with identical categories", () => {
    recordAidPaaminnelse(event);
    recordAidPaaminnelse(event);
    expect(pushEvent).toHaveBeenCalledTimes(2);
    expect(pushEvent.mock.calls.every((call) => call[3].skipDedupe)).toBe(true);
  });
  it("rejects action outcomes on delivery events and vice versa", () => {
    // @ts-expect-error Delivery events cannot have action outcomes.
    recordAidPaaminnelse({ ...event, hendelse: "vist" });
    // @ts-expect-error Action events cannot have delivery outcomes.
    recordAidPaaminnelse({ ...event, utfall: "tilgjengelig" });
    expect(pushEvent).not.toHaveBeenCalled();
  });
  it("does not throw when APM is absent or fails", () => {
    getBrowserObservability.mockReturnValue(undefined);
    expect(() => recordAidPaaminnelse(event)).not.toThrow();
    getBrowserObservability.mockImplementation(() => {
      throw new Error("not ready");
    });
    expect(() => recordAidPaaminnelse(event)).not.toThrow();
  });

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
