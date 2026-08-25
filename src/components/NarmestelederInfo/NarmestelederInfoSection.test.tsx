import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "../../utils/test/testUtils";
import NarmestelederInfoSection from "./NarmestelederInfoSection";

const { useTiltaksgruppeForVirksomhetsvalgMock } = vi.hoisted(() => ({
  useTiltaksgruppeForVirksomhetsvalgMock: vi.fn(),
}));

vi.mock(
  "../../services/tiltakspakke/useTiltaksgruppeForVirksomhetsvalg",
  () => ({
    useTiltaksgruppeForVirksomhetsvalg: useTiltaksgruppeForVirksomhetsvalgMock,
  }),
);

const ANSVARSHEADING = "Ditt ansvar når en av dine ansatte er sykmeldt";
const TIPSHEADING = "Tips til deg som nærmeste leder";

describe("NarmestelederInfoSection", () => {
  beforeEach(() => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReset();
  });

  it("erstatter film og tips med ansvarsseksjonen for tiltaksgruppen", () => {
    useTiltaksgruppeForVirksomhetsvalgMock.mockReturnValue({
      erITiltaksgruppe: true,
      erVurderingFerdig: true,
    });

    render(<NarmestelederInfoSection />);

    expect(
      screen.getByRole("heading", { name: ANSVARSHEADING }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: TIPSHEADING }),
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
