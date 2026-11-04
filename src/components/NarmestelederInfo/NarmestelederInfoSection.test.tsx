import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "../../utils/test/testUtils";
import NarmestelederInfoSection from "./NarmestelederInfoSection";

const {
  useTiltaksgruppeForVirksomhetsvalgMock,
  pushEvent,
  getBrowserObservability,
} = vi.hoisted(() => ({
  useTiltaksgruppeForVirksomhetsvalgMock: vi.fn(),
  pushEvent: vi.fn(),
  getBrowserObservability: vi.fn(),
}));

vi.mock(
  "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg",
  () => ({
    useTiltaksgruppeForVirksomhetsvalg: useTiltaksgruppeForVirksomhetsvalgMock,
  }),
);
vi.mock("../../observability/browser", () => ({ getBrowserObservability }));

const ANSVARSHEADING = "Ditt ansvar når en av dine ansatte er sykmeldt";
const TIPSHEADING = "Tips til deg som nærmeste leder";
const MER_OM_OPPFOLGING_HEADING = "Mer om oppfølgingen";

describe("NarmestelederInfoSection", () => {
  beforeEach(() => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReset();
    pushEvent.mockReset();
    getBrowserObservability.mockReturnValue({ api: { pushEvent } });
  });

  it("erstatter film og tips med ansvarsseksjonen for tiltaksgruppen", () => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
      erITiltaksgruppe: true,
      erVurderingFerdig: true,
      gruppe: "tiltak",
    });

    render(<NarmestelederInfoSection />);

    expect(
      screen.getByRole("heading", { name: ANSVARSHEADING }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: TIPSHEADING }),
    ).not.toBeInTheDocument();
  });

  it("registrerer klikk på lenke i den nye lenkelista", async () => {
    const user = userEvent.setup();
    useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
      erITiltaksgruppe: true,
      erVurderingFerdig: true,
      gruppe: "tiltak",
    });

    render(<NarmestelederInfoSection stegoversiktAktiv />);
    await user.click(
      screen.getByRole("link", { name: /Kontakt Nav som arbeidsgiver/ }),
    );

    expect(pushEvent).toHaveBeenCalledWith(
      "aid_stegoversikt",
      expect.objectContaining({
        schema_version: "1",
        flate: "stegoversikt",
        tiltakspakke: "2",
        gruppe: "tiltak",
        hendelse: "lenke_klikket",
        lenke: "kontakt_nav",
      }),
      "aid",
      { skipDedupe: true },
    );
  });

  it("viser den nye lenkelista for tiltaksgruppen når stegoversikten er aktiv", () => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
      erITiltaksgruppe: true,
      erVurderingFerdig: true,
      gruppe: "tiltak",
    });

    render(<NarmestelederInfoSection stegoversiktAktiv />);

    expect(
      screen.getByRole("heading", { name: MER_OM_OPPFOLGING_HEADING }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Oppfølging underveis i sykefraværet/,
      }),
    ).toHaveAttribute(
      "href",
      "https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte#dialogmote-2og3",
    );
    expect(
      screen.getByRole("link", { name: /Kontakt Nav som arbeidsgiver/ }),
    ).toHaveAttribute("href", "https://www.nav.no/arbeidsgiver/kontaktoss");
    expect(
      screen.queryByRole("heading", { name: ANSVARSHEADING }),
    ).not.toBeInTheDocument();
  });

  it("beholder baseline-lenkene for kontrollgruppen selv om togglen er aktiv", () => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
      erITiltaksgruppe: false,
      erVurderingFerdig: true,
    });

    render(<NarmestelederInfoSection stegoversiktAktiv />);

    expect(
      screen.getByRole("heading", { name: TIPSHEADING }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: MER_OM_OPPFOLGING_HEADING }),
    ).not.toBeInTheDocument();
  });

  it("beholder eksisterende film og tips utenfor tiltaksgruppen", () => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
      erITiltaksgruppe: false,
      erVurderingFerdig: true,
    });

    render(<NarmestelederInfoSection />);

    expect(
      screen.getByRole("heading", { name: TIPSHEADING }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: ANSVARSHEADING }),
    ).not.toBeInTheDocument();
  });

  it("viser ingen av variantene før tiltakspakkevurderingen er avklart", () => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
      erITiltaksgruppe: false,
      erVurderingFerdig: false,
    });

    render(<NarmestelederInfoSection />);

    expect(
      screen.queryByRole("heading", { name: TIPSHEADING }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: ANSVARSHEADING }),
    ).not.toBeInTheDocument();
  });
});
