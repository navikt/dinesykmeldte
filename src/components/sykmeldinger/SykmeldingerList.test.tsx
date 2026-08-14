import mockRouter from "next-router-mock";
import { beforeEach, describe, expect, it } from "vitest";
import {
  MineSykmeldteDocument,
  SykmeldingByIdDocument,
  VirksomheterDocument,
} from "../../graphql/queries/graphql.generated";
import {
  createAktivitetIkkeMuligPeriode,
  createInitialQuery,
  createPreviewSykmeldt,
  createSykmelding,
  createVirksomhet,
} from "../../utils/test/dataCreators";
import { render, screen, within } from "../../utils/test/testUtils";
import SykmeldingerList from "./SykmeldingerList";

describe("SykmeldingerList", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should render sykmeldinger in sections according to lest status", () => {
    mockRouter.setCurrentUrl(
      "/sykmeldt/narmesteleder-1-08088012345/sykmeldinger",
    );
    const sykmeldinger = [
      createSykmelding({ id: "sykmelding-1", lest: false }),
      createSykmelding({ id: "sykmelding-2", lest: true }),
      createSykmelding({ id: "sykmelding-3", lest: false }),
    ];
    const sykmeldt = createPreviewSykmeldt({ sykmeldinger });

    render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={sykmeldt} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [sykmeldt],
        }),
        ...sykmeldinger.map((sykmelding) =>
          createInitialQuery(
            SykmeldingByIdDocument,
            { __typename: "Query", sykmelding },
            { sykmeldingId: sykmelding.id },
          ),
        ),
      ],
    });

    const unreadSection = within(
      screen.getByRole("region", { name: "Uleste" }),
    );
    expect(
      unreadSection.getAllByRole("link", { name: /Sykmelding/ }),
    ).toHaveLength(2);

    const readSection = within(screen.getByRole("region", { name: "Leste" }));
    expect(
      readSection.getAllByRole("link", { name: /Sykmelding/ }),
    ).toHaveLength(1);
  });

  it("should link to the correct path", () => {
    const sykmelding = createSykmelding({ id: "sykmelding-1" });
    const sykmeldt = createPreviewSykmeldt({
      sykmeldinger: [sykmelding],
    });

    render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={sykmeldt} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [sykmeldt],
        }),
        createInitialQuery(
          SykmeldingByIdDocument,
          { __typename: "Query", sykmelding: sykmelding },
          { sykmeldingId: "sykmelding-1" },
        ),
      ],
    });

    expect(screen.getByRole("link", { name: /Sykmelding/ })).toHaveAttribute(
      "href",
      "/sykmeldt/test-id/sykmelding/sykmelding-1",
    );
  });

  it("should sort by date, newest first", () => {
    const sykmeldinger = [
      createSykmelding({
        id: "sykmelding-1",
        perioder: [
          createAktivitetIkkeMuligPeriode({
            fom: "2020-01-01",
            tom: "2020-01-05",
          }),
        ],
      }),
      createSykmelding({
        id: "sykmelding-2",
        perioder: [
          createAktivitetIkkeMuligPeriode({
            fom: "2022-01-01",
            tom: "2022-01-05",
          }),
        ],
      }),
      createSykmelding({
        id: "sykmelding-3",
        perioder: [
          createAktivitetIkkeMuligPeriode({
            fom: "2019-01-01",
            tom: "2019-01-05",
          }),
        ],
      }),
    ];

    const sykmeldt = createPreviewSykmeldt({ sykmeldinger });

    render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={sykmeldt} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [sykmeldt],
        }),
        ...sykmeldinger.map((sykmelding) =>
          createInitialQuery(
            SykmeldingByIdDocument,
            { __typename: "Query", sykmelding: sykmelding },
            { sykmeldingId: sykmelding.id },
          ),
        ),
      ],
    });

    const unreadSection = within(
      screen.getByRole("region", { name: "Uleste" }),
    );
    const links = unreadSection.getAllByRole("link", { name: /Sykmelding/ });

    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent("1. januar 2022 - 5. januar 2022");
    expect(links[1]).toHaveTextContent("1. januar 2020 - 5. januar 2020");
    expect(links[2]).toHaveTextContent("1. januar 2019 - 5. januar 2019");
  });

  /*
   * Regresjonsvern for #772: den gamle «Har du behov for et dialogmøte?»-boksen
   * på Dine sykmeldte er fjernet, men dette er en annen komponent på
   * sykmeldinger-siden, og den skal fortsatt stå.
   */
  it("viser dialogmøtepanelet på sykmeldinger-siden når den sykmeldte har vært sykmeldt i mer enn 42 dager", async () => {
    mockRouter.setCurrentUrl(
      "/sykmeldt/narmesteleder-1-08088012345/sykmeldinger",
    );
    const sykmelding = createSykmelding({
      id: "sykmelding-1",
      perioder: [
        createAktivitetIkkeMuligPeriode({
          fom: "2021-08-08",
          tom: "2021-09-30",
        }),
      ],
    });
    const sykmeldt = createPreviewSykmeldt({
      navn: "Ola Normann",
      sykmeldinger: [sykmelding],
    });

    render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={sykmeldt} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [sykmeldt],
        }),
        createInitialQuery(
          SykmeldingByIdDocument,
          { __typename: "Query", sykmelding },
          { sykmeldingId: sykmelding.id },
        ),
        // Dialogmøtepanelet henter den sykmeldte via `useSykmeldt`, som også
        // laster virksomhetene. Uten dem i cachen ville testen logget en
        // nettverksfeil for et kall som ikke er det vi tester.
        createInitialQuery(VirksomheterDocument, {
          __typename: "Query",
          virksomheter: [createVirksomhet()],
        }),
      ],
    });

    expect(
      await screen.findByRole("heading", {
        name: "Har dere behov for et dialogmøte?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "be om et dialogmøte med Ola og NAV" }),
    ).toHaveAttribute(
      "href",
      "https://www.nav.no/syk/dialogmoter/arbeidsgiver/test-id",
    );
  });
});
