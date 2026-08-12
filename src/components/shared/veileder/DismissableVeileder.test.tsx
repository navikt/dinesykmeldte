import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "../../../utils/test/testUtils";
import DismissableVeileder from "./DismissableVeileder";

const TEKST = "Hei, du har personalansvar for noen som er sykmeldt.";

beforeEach(() => {
  window.localStorage.clear();
});

describe("DismissableVeileder", () => {
  it("fjerner all luft sammen med boksen når brukeren lukker den", async () => {
    const { container } = render(
      <DismissableVeileder
        storageKey="test-veileder"
        text={TEKST}
        paddingBlock="space-16 space-0"
      />,
    );

    expect(screen.getByText(TEKST)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(screen.queryByText(TEKST)).not.toBeInTheDocument();
    // Ingenting skal bli stående igjen – heller ikke en tom spacing-wrapper.
    expect(container).toBeEmptyDOMElement();
  });

  it("skjuler luften rundt boksen ved utskrift, slik boksen selv skjules", () => {
    const { container } = render(
      <DismissableVeileder
        storageKey="test-veileder"
        text={TEKST}
        paddingBlock="space-16 space-0"
      />,
    );

    const veileder = screen.getByRole("article", {
      name: "Veiledende informasjon",
    });

    // Alt som rendres rundt veilederen må skjules ved utskrift, ellers står
    // luften igjen som en tom blokk på papiret.
    for (
      let element: Element | null = veileder;
      element !== null && element !== container;
      element = element.parentElement
    ) {
      expect(element).toHaveClass("print:hidden");
    }
  });

  it("rendrer uten ekstra wrapper når den ikke er bedt om ekstra luft", () => {
    const { container } = render(
      <DismissableVeileder storageKey="test-veileder" text={TEKST} />,
    );

    const veileder = screen.getByRole("article", {
      name: "Veiledende informasjon",
    });

    expect(container.firstElementChild).toBe(veileder);
  });
});
