import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DIALOGMOTE_TILTAKSPAKKE_2,
  OPPFOLGINGSPLAN_TILTAKSPAKKE_1,
  type TiltakspakkevurderingTiltakspakkeId,
} from "../../services/tiltakspakke/tiltakspakkevurderingContract";
import { render, screen, within } from "../../utils/test/testUtils";
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
const MER_OM_OPPFOLGING_HEADING =
  "Mer om hvordan du kan følge opp dine arbeidstakere som er sykmeldt";

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

  it.each([
    ["Følg opp sykefravær (Idébanken)", "videre_oppfolging"],
    ["Kontakt Nav", "kontakt_nav"],
  ])("registrerer klikk på lenken «%s» i den nye lenkelista", async (lenketekst, lenke) => {
    const user = userEvent.setup();
    renderStegoversiktForTiltaksgruppen();

    await user.click(screen.getByRole("link", { name: lenketekst }));

    expect(pushEvent).toHaveBeenCalledWith(
      "aid_stegoversikt",
      expect.objectContaining({
        schema_version: "1",
        flate: "stegoversikt",
        tiltakspakke: "2",
        gruppe: "tiltak",
        hendelse: "lenke_klikket",
        lenke,
      }),
      "aid",
      { skipDedupe: true },
    );
  });

  it("åpner begge lenkene i ny fane uten tilgang til opener", () => {
    renderStegoversiktForTiltaksgruppen();

    for (const name of ["Følg opp sykefravær (Idébanken)", "Kontakt Nav"]) {
      const lenke = screen.getByRole("link", { name });
      expect(lenke).toHaveAttribute("target", "_blank");
      expect(lenke).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("grupperer lenkene i en liste under overskriften", () => {
    renderStegoversiktForTiltaksgruppen();

    const seksjon = screen.getByRole("region", {
      name: MER_OM_OPPFOLGING_HEADING,
    });
    const elementer = within(within(seksjon).getByRole("list")).getAllByRole(
      "listitem",
    );

    expect(elementer).toHaveLength(2);
    expect(
      within(elementer[0]).getByRole("link", {
        name: "Følg opp sykefravær (Idébanken)",
      }),
    ).toBeInTheDocument();
    expect(
      within(elementer[1]).getByRole("link", {
        name: "Kontakt Nav",
      }),
    ).toBeInTheDocument();
  });

  it("viser den nye lenkelista for tiltaksgruppen når stegoversikten er aktiv", () => {
    renderStegoversiktForTiltaksgruppen();

    expect(
      screen.getByRole("heading", { name: MER_OM_OPPFOLGING_HEADING }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Følg opp sykefravær (Idébanken)",
      }),
    ).toHaveAttribute("href", "https://idebanken.no/folge-opp-sykefravaer");
    expect(screen.getByRole("link", { name: "Kontakt Nav" })).toHaveAttribute(
      "href",
      "https://www.nav.no/arbeidsgiver/kontaktoss",
    );
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

  it("viser ansvarsseksjonen, ikke den nye lenkelista, når virksomheten bare er i tiltaksgruppen for tiltakspakke 1", () => {
    mockTiltaksgruppePerPakke({
      [OPPFOLGINGSPLAN_TILTAKSPAKKE_1]: true,
      [DIALOGMOTE_TILTAKSPAKKE_2]: false,
    });

    render(<NarmestelederInfoSection stegoversiktAktiv />);

    expect(
      screen.getByRole("heading", { name: ANSVARSHEADING }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: MER_OM_OPPFOLGING_HEADING }),
    ).not.toBeInTheDocument();
  });

  it("viser den nye lenkelista for tiltaksgruppen i tiltakspakke 2 selv om virksomheten ikke er i tiltaksgruppen for tiltakspakke 1", () => {
    mockTiltaksgruppePerPakke({
      [OPPFOLGINGSPLAN_TILTAKSPAKKE_1]: false,
      [DIALOGMOTE_TILTAKSPAKKE_2]: true,
    });

    render(<NarmestelederInfoSection stegoversiktAktiv />);

    expect(
      screen.getByRole("heading", { name: MER_OM_OPPFOLGING_HEADING }),
    ).toBeInTheDocument();
  });

  it("beholder baseline-lenkene for tiltaksgruppen i tiltakspakke 2 når togglen er av", () => {
    mockTiltaksgruppePerPakke({
      [OPPFOLGINGSPLAN_TILTAKSPAKKE_1]: false,
      [DIALOGMOTE_TILTAKSPAKKE_2]: true,
    });

    render(<NarmestelederInfoSection />);

    expect(
      screen.getByRole("heading", { name: TIPSHEADING }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: MER_OM_OPPFOLGING_HEADING }),
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

function renderStegoversiktForTiltaksgruppen(): void {
  useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
    erITiltaksgruppe: true,
    erVurderingFerdig: true,
    gruppe: "tiltak",
  });

  render(<NarmestelederInfoSection stegoversiktAktiv />);
}

function mockTiltaksgruppePerPakke(
  erITiltaksgruppe: Record<TiltakspakkevurderingTiltakspakkeId, boolean>,
): void {
  useTiltaksgruppeForVirksomhetsvalgMock.mockImplementation(
    (tiltakspakkeId: TiltakspakkevurderingTiltakspakkeId) => ({
      erITiltaksgruppe: erITiltaksgruppe[tiltakspakkeId],
      erVurderingFerdig: true,
      gruppe: erITiltaksgruppe[tiltakspakkeId] ? "tiltak" : "kontroll",
    }),
  );
}
