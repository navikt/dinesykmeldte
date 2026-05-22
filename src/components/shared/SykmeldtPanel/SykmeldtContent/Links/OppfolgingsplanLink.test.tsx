import { describe, expect, it } from "vitest";
import { createOppfolgingsplan } from "../../../../../utils/test/dataCreators";
import { render, screen } from "../../../../../utils/test/testUtils";
import OppfolgingsplanLink from "./OppfolgingsplanLink";

describe("OppfolgingsplanLink", () => {
  it("should link to new oppfolgingsplan if no hendelser", () => {
    render(<OppfolgingsplanLink sykmeldtId="test-id" oppfolgingsplaner={[]} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.nav.no/syk/oppfolgingsplan/test-id",
    );
  });

  it("should link to new oppfolgingsplan when there are hendelser", () => {
    render(
      <OppfolgingsplanLink
        sykmeldtId="test-id"
        oppfolgingsplaner={[createOppfolgingsplan()]}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.nav.no/syk/oppfolgingsplan/test-id",
    );
  });
});
