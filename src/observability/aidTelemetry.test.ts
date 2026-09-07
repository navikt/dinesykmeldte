import { beforeEach, describe, expect, it, vi } from "vitest";
import { type AidPaaminnelseEvent, recordAidPaaminnelse } from "./aidTelemetry";

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
  it("does not throw when APM is absent or fails", () => {
    getBrowserObservability.mockReturnValue(undefined);
    expect(() => recordAidPaaminnelse(event)).not.toThrow();
    getBrowserObservability.mockImplementation(() => {
      throw new Error("not ready");
    });
    expect(() => recordAidPaaminnelse(event)).not.toThrow();
  });
});
