import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../utils/test/testUtils";
import Aktivitet from "./Aktivitet";

/**
 * Vite resolverer statiske bilder til en URL-streng, mens next/legacy/image
 * forventer objektet Next lager under bygg (src, width, height).
 */
vi.mock("./aktivitetsvarsel.svg", () => ({
  default: {
    src: "/aktivitetsvarsel.svg",
    height: 200,
    width: 200,
  },
}));

describe("Aktivitet", () => {
  it("should link to the digital oppfolgingsplan for the sykmeldt", () => {
    render(<Aktivitet sykmeldtId="test-id" />);

    expect(
      screen.getByRole("link", { name: "Lag en digital oppfølgingsplan nå" }),
    ).toHaveAttribute("href", "https://www.nav.no/syk/oppfolgingsplan/test-id");
  });
});
