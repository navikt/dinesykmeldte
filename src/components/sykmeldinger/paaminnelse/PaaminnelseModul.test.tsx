import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UsePaaminnelse } from "../../../hooks/usePaaminnelse";
import { render, screen } from "../../../utils/test/testUtils";
import PaaminnelseModul from "./PaaminnelseModul";

const { usePaaminnelseMock } = vi.hoisted(() => ({
  usePaaminnelseMock: vi.fn(),
}));
const { logAmplitudeEventMock } = vi.hoisted(() => ({
  logAmplitudeEventMock: vi.fn(),
}));

vi.mock("../../../hooks/usePaaminnelse", () => ({
  usePaaminnelse: usePaaminnelseMock,
}));

vi.mock("../../../amplitude/amplitude", () => ({
  logAmplitudeEvent: logAmplitudeEventMock,
}));

const narmestelederId = "narmesteleder-1";
const fnr = "08088012345";
const orgnummer = "123456789";

beforeEach(() => {
  usePaaminnelseMock.mockReturnValue(createUsePaaminnelseState());
});

describe("PaaminnelseModul", () => {
  it("renders nothing when paaminnelse is hidden", () => {
    const { container } = render(
      <PaaminnelseModul narmestelederId={narmestelederId} />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(usePaaminnelseMock).toHaveBeenCalledWith(narmestelederId);
    expect(logAmplitudeEventMock).not.toHaveBeenCalled();
  });

  it("renders loading state", () => {
    usePaaminnelseMock.mockReturnValue(
      createUsePaaminnelseState({ status: "laster" }),
    );

    render(<PaaminnelseModul narmestelederId={narmestelederId} />);

    expect(screen.getByText("Sjekker påminnelse")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Påminnelse om oppfølgingsplan"),
    ).toHaveAttribute("aria-busy", "true");
    expect(logAmplitudeEventMock).not.toHaveBeenCalled();
  });

  it("renders tilbud and bestiller paaminnelse", async () => {
    const bestill = vi.fn();
    usePaaminnelseMock.mockReturnValue(
      createUsePaaminnelseState({
        status: "tilbud",
        paaminnelse: {
          status: "TILBUD",
          reminderTiming: { triggerAt: "2026-02-03T09:00:00.000+01:00" },
        },
        bestill,
      }),
    );

    render(<PaaminnelseModul narmestelederId={narmestelederId} />);

    expect(
      screen.getByRole("region", {
        name: "Start oppfølgingen tidlig",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "En tidlig samtale kan gjøre det enklere å finne ut hva den som er sykmeldt trenger for å komme tilbake i jobb. Som hovedregel skal dere lage en oppfølgingsplan sammen innen 4 uker.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Vil du ha en påminnelse når fristen nærmer seg?"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /påminnelse/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Påminnelsen er planlagt/),
    ).not.toBeInTheDocument();
    expect(logAmplitudeEventMock).toHaveBeenCalledWith({
      eventName: "komponent vist",
      data: { komponent: "påminnelse om oppfølgingsplan" },
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Bestill påminnelse" }),
    );

    expect(bestill).toHaveBeenCalledTimes(1);
    expect(logAmplitudeEventMock).toHaveBeenCalledWith({
      eventName: "handling",
      data: { navn: "bestill påminnelse om oppfølgingsplan" },
    });
    expectAmplitudeCallsWithoutPii();
  });

  it("renders bestilt and avbestiller paaminnelse", async () => {
    const avbestill = vi.fn();
    usePaaminnelseMock.mockReturnValue(
      createUsePaaminnelseState({
        status: "bestilt",
        paaminnelse: {
          status: "BESTILT",
          reminderTiming: { triggerAt: "2026-02-03T09:00:00.000+01:00" },
        },
        avbestill,
      }),
    );

    render(<PaaminnelseModul narmestelederId={narmestelederId} />);

    expect(
      screen.getByRole("region", {
        name: "Påminnelse er bestilt",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Vi gir beskjed når fristen for oppfølgingsplan nærmer seg.",
      ),
    ).toBeInTheDocument();

    // Regression test: the exact date/time should not be shown even if the backend sends triggerAt.
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
    expect(screen.queryByText(/09:00/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Påminnelsen er planlagt/),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Avbestill påminnelse" }),
    );

    expect(avbestill).toHaveBeenCalledTimes(1);
    expect(logAmplitudeEventMock).toHaveBeenCalledWith({
      eventName: "handling",
      data: { navn: "avbestill påminnelse om oppfølgingsplan" },
    });
    expectAmplitudeCallsWithoutPii();
  });

  it("shows inline error without hiding current state", () => {
    usePaaminnelseMock.mockReturnValue(
      createUsePaaminnelseState({
        status: "tilbud",
        paaminnelse: { status: "TILBUD" },
        inlineError: "BESTILLING_FEILET",
      }),
    );

    render(<PaaminnelseModul narmestelederId={narmestelederId} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Vi klarte ikke å bestille påminnelsen. Prøv igjen.",
    );
    expect(
      screen.getByRole("button", { name: "Bestill påminnelse" }),
    ).toBeInTheDocument();
  });

  it("logs component shown only once when visible state changes", () => {
    const { rerender } = render(
      <PaaminnelseModul narmestelederId={narmestelederId} />,
    );
    expect(logAmplitudeEventMock).not.toHaveBeenCalled();

    usePaaminnelseMock.mockReturnValue(
      createUsePaaminnelseState({
        status: "tilbud",
        paaminnelse: { status: "TILBUD" },
      }),
    );
    rerender(<PaaminnelseModul narmestelederId={narmestelederId} />);

    usePaaminnelseMock.mockReturnValue(
      createUsePaaminnelseState({
        status: "bestilt",
        paaminnelse: { status: "BESTILT" },
      }),
    );
    rerender(<PaaminnelseModul narmestelederId={narmestelederId} />);

    expect(logAmplitudeEventMock).toHaveBeenCalledTimes(1);
    expectAmplitudeCallsWithoutPii();
  });
});

function createUsePaaminnelseState(
  overrides?: Partial<UsePaaminnelse>,
): UsePaaminnelse {
  return {
    status: "skjult",
    paaminnelse: null,
    inlineError: null,
    isMutating: false,
    bestill: vi.fn(),
    avbestill: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  } as UsePaaminnelse;
}

function serializedAmplitudeCalls(): string {
  return JSON.stringify(logAmplitudeEventMock.mock.calls);
}

function expectAmplitudeCallsWithoutPii(): void {
  const serializedCalls = serializedAmplitudeCalls();

  expect(serializedCalls).not.toContain(narmestelederId);
  expect(serializedCalls).not.toContain(fnr);
  expect(serializedCalls).not.toContain(orgnummer);
}
