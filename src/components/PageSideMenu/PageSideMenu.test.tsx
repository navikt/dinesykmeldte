import { RootPages } from "@navikt/dinesykmeldte-sidemeny";
import { describe, expect, it } from "vitest";
import { createPreviewSykmeldt } from "../../utils/test/dataCreators";
import { render, screen } from "../../utils/test/testUtils";
import PageSideMenu from "./PageSideMenu";

describe("PageSideMenu", () => {
  it("renders only the remaining navigation links", () => {
    render(
      <PageSideMenu
        sykmeldt={createPreviewSykmeldt({ narmestelederId: "test-leder" })}
        activePage={RootPages.Sykmeldinger}
      />,
    );

    expect(
      screen.getAllByRole("button").map((link) => link.getAttribute("href")),
    ).toEqual([
      "/sykmeldt/test-leder/sykmeldinger",
      "/sykmeldt/test-leder/soknader",
      "/syk/dialogmoter/arbeidsgiver/test-leder",
      "https://www.nav.no/syk/oppfolgingsplan/test-leder",
      "/",
    ]);
  });

  it("does not render navigation without a sykmeldt", () => {
    render(
      <PageSideMenu sykmeldt={null} activePage={RootPages.Sykmeldinger} />,
    );

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
