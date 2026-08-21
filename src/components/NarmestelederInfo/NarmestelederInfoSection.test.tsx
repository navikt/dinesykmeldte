import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "../../utils/test/testUtils";
import NarmestelederInfoSection from "./NarmestelederInfoSection";

const { useVisKomIGangTidligMock } = vi.hoisted(() => ({
  useVisKomIGangTidligMock: vi.fn(),
}));

vi.mock("../komigangtidlig/useVisKomIGangTidlig", () => ({
  useVisKomIGangTidlig: useVisKomIGangTidligMock,
}));

const ANSVARSHEADING = "Ditt ansvar når en av dine ansatte er sykmeldt";
const TIPSHEADING = "Tips til deg som nærmeste leder";

describe("NarmestelederInfoSection", () => {
  beforeEach(() => {
    useVisKomIGangTidligMock.mockReset();
  });

  it("erstatter film og tips med ansvarsseksjonen for tiltaksgruppen", () => {
    useVisKomIGangTidligMock.mockReturnValue({
      visKomIGangTidlig: true,
      erAvklart: true,
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
    useVisKomIGangTidligMock.mockReturnValue({
      visKomIGangTidlig: false,
      erAvklart: true,
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
    useVisKomIGangTidligMock.mockReturnValue({
      visKomIGangTidlig: false,
      erAvklart: false,
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
