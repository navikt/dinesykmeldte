import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MerOmOppfolging from "./MerOmOppfolging";
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
  it("viser Ta kontakt som valgt fane på større skjermer", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    const holdKontaktenTab = await screen.findByRole("tab", {
      name: /Ta kontakt/,
    });

    expect(holdKontaktenTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("heading", { name: "Ta kontakt", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Dette er det viktigste du gjør i de første ukene av sykefraværet.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ta kontakt med den som er sykmeldt i løpet av de første dagene.",
      ),
    ).toBeInTheDocument();
  });

  it("viser tre steg i rekkefølge og ikke krav om aktivitet", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    const tabs = await screen.findAllByRole("tab");

    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent("Ta kontakt");
    expect(tabs[1]).toHaveTextContent("Lag en oppfølgingsplan");
    expect(tabs[2]).toHaveTextContent("Hold dialogmøte 1");
    for (const tab of tabs) {
      expect(tab).toHaveClass("aksel-tabs__tab--fill");
    }
  });

  it("viser oppdatert innhold i alle de tre stegene", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    expect(
      screen.getByText(
        "Spør hva du kan gjøre, og hvor lenge arbeidstakeren din tror sykefraværet vil vare.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Det er lurt å bli enige om hvor ofte og hvordan dere har kontakt videre.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Samtalestøtte på idebanken.no" }),
    ).toHaveAttribute(
      "href",
      "https://idebanken.no/folge-opp-sykefravaer/samtaler-ved-sykefravaer",
    );

    await user.click(
      screen.getByRole("tab", { name: /Lag en oppfølgingsplan/ }),
    );
    expect(
      screen.getByText(
        /^Lag en oppfølgingsplan sammen senest innen fire uker\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Hva dere avtaler, og gjerne hvem som gjør hva videre"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sett en dato for når dere skal se på planen igjen (dialogmøte 1) og send til legen når den er klar.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Hold dialogmøte 1/ }));
    expect(
      screen.getByText(
        "Som arbeidsgiver har du ansvar for å kalle inn til dialogmøte 1. Hovedmålet er at dere sammen går gjennom oppfølgingsplanen og oppdaterer den.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Husk å dokumentere endringene dere gjør og hvem som deltok i møtet.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Arbeidstakeren din har også et ansvar om å bidra (Medvirkningsplikten).",
      ),
    ).toBeInTheDocument();
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
  });

  it("viser de oppdaterte lenkene under sykmeldtlisten", async () => {
    render(<MerOmOppfolging gruppe="tiltak" />);

    expect(
      screen.getByRole("heading", {
        name: "Mer om hvordan du kan følge opp dine arbeidstakere som er sykmeldt",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Følg opp sykefravær (Idébanken)",
      }),
    ).toHaveAttribute("href", "https://idebanken.no/folge-opp-sykefravaer");
    expect(
      screen.getByText(
        "Her får du konkrete tips og verktøy du kan bruke i oppfølgingen",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kontakt Nav" })).toHaveAttribute(
      "href",
      "https://www.nav.no/arbeidsgiver/kontaktoss",
    );
    expect(
      screen.getByText("Ta kontakt om du trenger hjelp med en sak"),
    ).toBeInTheDocument();
  });

  it("lar brukeren navigere mellom faner med tastaturet", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<Stegoversikt gruppe="tiltak" />);

    const firstTab = await screen.findByRole("tab", {
      name: /Ta kontakt/,
    });
    firstTab.focus();
    await user.keyboard("{ArrowRight}");

    const oppfolgingsplanTab = screen.getByRole("tab", {
      name: /Lag en oppfølgingsplan/,
    });
    expect(oppfolgingsplanTab).toHaveFocus();
    expect(oppfolgingsplanTab).toHaveAttribute("aria-selected", "false");

    await user.keyboard("{Enter}");
    expect(oppfolgingsplanTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("heading", {
        name: "Lag oppfølgingsplan",
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
    expect(screen.getByRole("tab", { name: /Ta kontakt/ })).toHaveAttribute(
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
      await screen.findByRole("tab", { name: /Lag en oppfølgingsplan/ }),
    );

    expect(
      screen.getByText(/^Lag en oppfølgingsplan sammen senest innen fire uker/),
    ).toBeInTheDocument();
  });
});
