import { describe, expect, it } from "vitest";
import { render, screen } from "../../../../../utils/test/testUtils";
import OppfolgingsplanLink from "./OppfolgingsplanLink";

describe("OppfolgingsplanLink", () => {
  it("should link to redirect without IDs if no hendelser", () => {
    render(
      <OppfolgingsplanLink
        sykmeldtId="test-id"
        pilotUser={false}
        oppfolgingsplaner={[]}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.nav.no/syk/oppfolgingsplaner/arbeidsgiver/test-id",
    );
  });

  it("should link to new oppfolgingsplan for pilot users", () => {
    render(
      <OppfolgingsplanLink
        sykmeldtId="test-id"
        pilotUser={true}
        oppfolgingsplaner={[]}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.nav.no/syk/oppfolgingsplan/test-id",
    );
  });
});
