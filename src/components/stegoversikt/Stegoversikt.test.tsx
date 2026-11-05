import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Stegoversikt from "./Stegoversikt";

const { pushEvent, getBrowserObservability } = vi.hoisted(() => ({
  pushEvent: vi.fn(),
  getBrowserObservability: vi.fn(),
}));
vi.mock("../../observability/browser", () => ({ getBrowserObservability }));

beforeEach(() => {
  pushEvent.mockReset();
  getBrowserObservability.mockReturnValue({ api: { pushEvent } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Stegoversikt", () => {
  it("viser Hold kontakten som valgt fane på større skjermer", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    const holdKontaktenTab = await screen.findByRole("tab", {
      name: /Hold kontakten/,
    });

    expect(holdKontaktenTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("heading", { name: "Hold kontakten", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ta kontakt tidlig, og hold jevnlig kontakt/),
    ).toBeInTheDocument();
  });

  it("viser tre steg i rekkefølge og ikke krav om aktivitet", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    const tabs = await screen.findAllByRole("tab");

    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent("Hold kontakten");
    expect(tabs[1]).toHaveTextContent("Oppfølgingsplan");
    expect(tabs[2]).toHaveTextContent("Dialogmøte 1");
    for (const tab of tabs) {
      expect(tab).toHaveClass("aksel-tabs__tab--fill");
    }
  });

  it("viser innholdet for valgt fane og lenker til bekreftede mål", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    await user.click(await screen.findByRole("tab", { name: /Dialogmøte 1/ }));

    expect(pushEvent).toHaveBeenCalledWith(
      "aid_stegoversikt",
      expect.objectContaining({
        schema_version: "1",
        flate: "stegoversikt",
        tiltakspakke: "2",
        gruppe: "tiltak",
        hendelse: "fane_valgt",
        fane: "dialogmote_1",
      }),
      "aid",
      { skipDedupe: true },
    );
    expect(
      screen.getByRole("heading", { name: "Hold dialogmøte 1", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Slik gjennomfører dere dialogmøte 1",
      }),
    ).toHaveAttribute("href", "https://www.nav.no/dialogmote#dialogmote-1");
  });

  it("lar brukeren navigere mellom faner med tastaturet", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    const firstTab = await screen.findByRole("tab", {
      name: /Hold kontakten/,
    });
    firstTab.focus();
    await user.keyboard("{ArrowRight}");

    const oppfolgingsplanTab = screen.getByRole("tab", {
      name: /Oppfølgingsplan/,
    });
    expect(oppfolgingsplanTab).toHaveFocus();
    expect(oppfolgingsplanTab).toHaveAttribute("aria-selected", "false");

    await user.keyboard("{Enter}");
    expect(oppfolgingsplanTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("heading", {
        name: "Lag oppfølgingsplanen sammen",
        level: 3,
      }),
    ).toBeInTheDocument();
  });

  it("registrerer at stegoversikten er vist én gang når den kommer inn i visningen", async () => {
    let observerCallback: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();
    class TestIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin = "0px";
      readonly scrollMargin = "0px";
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }

      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnect;
      takeRecords = () => [];
    }

    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);
    await screen.findByRole("tablist");

    const intersection = { isIntersecting: true } as IntersectionObserverEntry;
    act(() => {
      observerCallback?.([intersection], {} as IntersectionObserver);
      observerCallback?.([intersection], {} as IntersectionObserver);
    });

    expect(pushEvent).toHaveBeenCalledExactlyOnceWith(
      "aid_stegoversikt",
      {
        schema_version: "1",
        flate: "stegoversikt",
        tiltakspakke: "2",
        gruppe: "tiltak",
        hendelse: "vist",
      },
      "aid",
      { skipDedupe: true },
    );
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("starter lukket på mobil og lar brukeren åpne innholdet", async () => {
    const user = userEvent.setup();
    const matchMedia = vi.fn(() => ({ matches: true }));
    vi.stubGlobal("matchMedia", matchMedia);
    render(<Stegoversikt gruppe="tiltak" />);
    expect(matchMedia).toHaveBeenCalledWith("(max-width: 767px)");

    const toggle = screen.getByRole("button", { name: "Hva du skal gjøre" });
    await waitFor(() =>
      expect(toggle).toHaveAttribute("aria-expanded", "false"),
    );
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();

    toggle.focus();
    await user.keyboard("{Enter}");

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Hold kontakten/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("viser innholdet åpent når nettleseren mangler matchMedia", async () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<Stegoversikt gruppe="tiltak" />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Hva du skal gjøre" }),
      ).toHaveAttribute("aria-expanded", "true"),
    );
  });

  it("sier at oppfølgingsplanen skal være klar senest innen 4 uker", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    await user.click(
      await screen.findByRole("tab", { name: /Oppfølgingsplan/ }),
    );

    expect(screen.getByText(/senest innen 4 uker/)).toBeInTheDocument();
  });
});
