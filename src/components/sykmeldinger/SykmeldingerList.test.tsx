import mockRouter from "next-router-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MineSykmeldteDocument,
  SykmeldingByIdDocument,
} from "../../graphql/queries/graphql.generated";
import type { UsePaaminnelse } from "../../hooks/usePaaminnelse";
import {
  createAktivitetIkkeMuligPeriode,
  createInitialQuery,
  createPreviewSykmeldt,
  createSykmelding,
} from "../../utils/test/dataCreators";
import { render, screen, within } from "../../utils/test/testUtils";
import SykmeldingerList from "./SykmeldingerList";

const { usePaaminnelseMock } = vi.hoisted(() => ({
  usePaaminnelseMock: vi.fn(),
}));

vi.mock("../../hooks/usePaaminnelse", () => ({
  usePaaminnelse: usePaaminnelseMock,
}));

beforeEach(() => {
  usePaaminnelseMock.mockReturnValue(createUsePaaminnelseState());
});

describe("SykmeldingerList", () => {
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

  it("renders paaminnelse module before read sykmeldinger", () => {
    usePaaminnelseMock.mockReturnValue(
      createUsePaaminnelseState({
        status: "tilbud",
        paaminnelse: { status: "TILBUD" },
      }),
    );
    const sykmeldinger = [createSykmelding({ id: "sykmelding-1", lest: true })];
    const sykmeldt = createPreviewSykmeldt({
      narmestelederId: "narmesteleder-1",
      sykmeldinger,
    });

    render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={sykmeldt} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [sykmeldt],
        }),
        createInitialQuery(
          SykmeldingByIdDocument,
          { __typename: "Query", sykmelding: sykmeldinger[0] },
          { sykmeldingId: "sykmelding-1" },
        ),
      ],
    });

    const paaminnelseSection = screen.getByRole("region", {
      name: "Vil du bli minnet på oppfølgingsplanen?",
    });
    const readSection = screen.getByRole("region", { name: "Leste" });

    expect(
      paaminnelseSection.compareDocumentPosition(readSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(usePaaminnelseMock).toHaveBeenCalledWith("narmesteleder-1");
  });

  it("does not check paaminnelse when sykmeldt has no sykmeldinger", () => {
    const sykmeldt = createPreviewSykmeldt({ sykmeldinger: [] });

    render(<SykmeldingerList sykmeldtId="test-id" sykmeldt={sykmeldt} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [sykmeldt],
        }),
      ],
    });

    expect(
      screen.getByText("Vi fant ingen sykmeldinger for Ola Normann."),
    ).toBeInTheDocument();
    expect(usePaaminnelseMock).not.toHaveBeenCalled();
  });
});

function createUsePaaminnelseState(
  overrides?: Partial<UsePaaminnelse>,
): UsePaaminnelse {
  return {
    status: "skjult",
    paaminnelse: null,
    inlineError: null,
    isMutating: false,
    bestill: vi.fn(),
    avbestill: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  } as UsePaaminnelse;
}
