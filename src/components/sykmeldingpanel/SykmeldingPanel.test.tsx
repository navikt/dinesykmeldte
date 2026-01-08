import { within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createAktivitetIkkeMuligPeriode,
  createGradertPeriode,
  createSykmelding,
} from "../../utils/test/dataCreators";
import { render, screen } from "../../utils/test/testUtils";
import SykmeldingPanel from "./SykmeldingPanel";

describe("SykmeldingPanel", () => {
  it("should show correct info", async () => {
    render(<SykmeldingPanel sykmelding={createSykmelding()} />);

    expect(
      screen.getByRole("heading", { name: "Opplysninger fra sykmeldingen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("listitem", { name: "Sykmeldingen gjelder" }),
    ).toHaveTextContent("Test Testysson");

    const arbeidsSection = within(
      screen.getByRole("listitem", { name: "Muligheter for arbeid" }),
    );
    expect(
      arbeidsSection.getByRole("listitem", {
        name: "Pasienten kan ikke være i arbeid (100% sykmelding)",
      }),
    ).toHaveTextContent("8. august 2021 - 15. august 2021");

    const prognoseSection = within(
      screen.getByRole("listitem", { name: "Friskmelding/Prognose" }),
    );
    expect(
      prognoseSection.getByRole("listitem", {
        name: "Eventuelle hensyn som må tas på arbeidsplassen",
      }),
    ).toHaveTextContent("Hensyn på arbeidsplassen");
    const arbeidsevneSection = within(
      screen.getByRole("listitem", {
        name: "Hva skal til for å bedre arbeidsevnen?",
      }),
    );
    expect(
      arbeidsevneSection.getByRole("listitem", {
        name: "Tilrettelegging/hensyn som bør tas på arbeidsplassen",
      }),
    ).toHaveTextContent("Flere pauser");
  });

  it("should show correct info given multiple periods", async () => {
    render(
      <SykmeldingPanel
        sykmelding={createSykmelding({
          perioder: [createAktivitetIkkeMuligPeriode(), createGradertPeriode()],
        })}
      />,
    );

    expect(
      screen.getByRole("listitem", {
        name: "Pasienten kan ikke være i arbeid (100% sykmelding)",
      }),
    ).toHaveTextContent("8. august 2021 - 15. august 2021");
    expect(
      screen.getByRole("listitem", { name: "67% sykmelding" }),
    ).toHaveTextContent("16. august 2021 - 20. august 2021");
  });

  it("should show arbeidsforEtterPeriode when true", () => {
    const fnr = "09640086212";

    render(
      <SykmeldingPanel
        sykmelding={createSykmelding({
          fnr: fnr,
          arbeidsforEtterPeriode: true,
        })}
      />,
    );

    const prognoseSection = within(
      screen.getByRole("listitem", { name: "Friskmelding/Prognose" }),
    );
    expect(
      prognoseSection.getByText(
        "Pasienten er 100% arbeidsfør etter denne perioden",
      ),
    ).toBeInTheDocument();
  });

  it("should show arbeidsforEtterPeriode when false", () => {
    const fnr = "09640086212";

    render(
      <SykmeldingPanel
        sykmelding={createSykmelding({
          fnr: fnr,
          arbeidsforEtterPeriode: false,
        })}
      />,
    );

    const prognoseSection = within(
      screen.getByRole("listitem", { name: "Friskmelding/Prognose" }),
    );
    expect(
      prognoseSection.getByText(
        "Behandler har ikke notert om pasienten er arbeidsfør etter denne perioden",
      ),
    ).toBeInTheDocument();
  });

  it("should show arbeidsforEtterPeriode when null", () => {
    const fnr = "09640086212";

    render(
      <SykmeldingPanel
        sykmelding={createSykmelding({
          fnr: fnr,
          arbeidsforEtterPeriode: null,
        })}
      />,
    );

    const prognoseSection = within(
      screen.getByRole("listitem", { name: "Friskmelding/Prognose" }),
    );
    expect(
      prognoseSection.queryByText(
        "Pasienten er 100% arbeidsfør etter denne perioden",
      ),
    ).not.toBeInTheDocument();
    expect(
      prognoseSection.getByText(
        "Behandler har ikke notert om pasienten er arbeidsfør etter denne perioden",
      ),
    ).toBeInTheDocument();
  });

  describe("given innspillArbeidsplassen", () => {
    it("should display innspillArbeidsplassen when not null", () => {
      const fnr = "09640086212";

      render(
        <SykmeldingPanel
          sykmelding={createSykmelding({
            fnr: fnr,
            innspillArbeidsplassen: "Må ta 200 sits-ups på jobb",
          })}
        />,
      );

      const prognoseSection = within(
        screen.getByRole("listitem", { name: "Melding til arbeidsgiver" }),
      );
      expect(prognoseSection.getByText("Må ta 200 sits-ups på jobb"));
    });

    it("should not display at all when innspillArbeidsplassen is null", () => {
      const fnr = "09640086212";

      render(
        <SykmeldingPanel
          sykmelding={createSykmelding({
            fnr: fnr,
            innspillArbeidsplassen: null,
          })}
        />,
      );

      expect(
        screen.queryByRole("region", { name: "Melding til arbeidsgiver" }),
      ).not.toBeInTheDocument();
    });
  });
});
