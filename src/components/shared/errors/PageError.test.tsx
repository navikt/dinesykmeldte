import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../../utils/test/testUtils";
import PageError from "./PageError";

/**
 * Sikkerhetsregresjonstester: PageError skal aldri sende rå cause-streng
 * til amplitude-analytics. cause kan inneholde Apollo/backend-feiltekst
 * eller URL-paths med person-ID-er (f.eks. "sykmelding/secret-id-123").
 *
 * Se: security-review — PII-klassifisering, Strengt fortrolig/Fortrolig.
 */

const { mockUseLogAmplitudeEvent } = vi.hoisted(() => ({
  mockUseLogAmplitudeEvent: vi.fn(),
}));

vi.mock("../../../amplitude/amplitude", () => ({
  useLogAmplitudeEvent: mockUseLogAmplitudeEvent,
}));

describe("PageError — amplitude-sikkerhet", () => {
  beforeEach(() => {
    mockUseLogAmplitudeEvent.mockClear();
  });

  it("sender ikke rå cause til amplitude (ingen extraData)", () => {
    render(<PageError cause="sykmelding/secret-id-123" />);

    expect(mockUseLogAmplitudeEvent).toHaveBeenCalledOnce();
    const [, extraData] = mockUseLogAmplitudeEvent.mock.calls[0];
    expect(extraData).toBeUndefined();
  });

  it("sender ikke backend-feiltekst med ID-er til amplitude", () => {
    render(
      <PageError cause="Apollo error: Access denied to /sykmelding/secret-id-123" />,
    );

    expect(mockUseLogAmplitudeEvent).toHaveBeenCalledOnce();
    const [, extraData] = mockUseLogAmplitudeEvent.mock.calls[0];
    // extraData?.cause må aldri inneholde feiltekst eller ID-er
    const causeValue = (extraData as Record<string, unknown> | undefined)
      ?.cause;
    expect(causeValue).toBeUndefined();
  });

  it("sender faste, PII-frie properties i event.data", () => {
    render(<PageError cause="any-cause" text="Tilpasset feilmelding" />);

    expect(mockUseLogAmplitudeEvent).toHaveBeenCalledOnce();
    const [event] = mockUseLogAmplitudeEvent.mock.calls[0];
    expect(event.eventName).toBe("guidepanel vist");
    expect(event.data.komponent).toBe("PageError");
    expect(event.data.tekst).toBe("Tilpasset feilmelding");
  });
});
