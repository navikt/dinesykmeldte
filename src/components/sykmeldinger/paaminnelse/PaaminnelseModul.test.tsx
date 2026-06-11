import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UsePaaminnelse } from "../../../hooks/usePaaminnelse";
import { render, screen } from "../../../utils/test/testUtils";
import PaaminnelseModul from "./PaaminnelseModul";

const { usePaaminnelseMock } = vi.hoisted(() => ({
  usePaaminnelseMock: vi.fn(),
}));

vi.mock("../../../hooks/usePaaminnelse", () => ({
  usePaaminnelse: usePaaminnelseMock,
}));

const narmestelederId = "narmesteleder-1";

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
        name: "Vil du bli minnet på oppfølgingsplanen?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /påminnelse/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Påminnelsen er planlagt/),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Bestill påminnelse" }),
    );

    expect(bestill).toHaveBeenCalledTimes(1);
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
        name: "Påminnelse om oppfølgingsplan er bestilt",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Påminnelsen er planlagt 3. februar 2026, 09:00."),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Avbestill påminnelse" }),
    );

    expect(avbestill).toHaveBeenCalledTimes(1);
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
