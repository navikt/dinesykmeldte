import type { MockedResponse } from "@apollo/client/testing";
import { describe, expect, it, type Mock, vi } from "vitest";
import {
  MarkSoknadReadDocument,
  MineSykmeldteDocument,
  type PreviewSykmeldtFragment,
} from "../../graphql/queries/graphql.generated";
import {
  createInitialQuery,
  createMock,
  createPreviewFremtidigSoknad,
  createPreviewNySoknad,
  createPreviewSendtSoknad,
  createPreviewSykmeldt,
} from "../../utils/test/dataCreators";
import { render, screen, waitFor, within } from "../../utils/test/testUtils";
import SoknaderList from "./SoknaderList";

describe("SoknaderList", () => {
  function setup(
    sykmeldt: PreviewSykmeldtFragment,
    mocks?: MockedResponse[],
  ): void {
    render(<SoknaderList sykmeldtId="test-sykmeldt-id" sykmeldt={sykmeldt} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [sykmeldt],
        }),
      ],
      mocks,
    });
  }

  it("should render søknader in sections according to status", () => {
    setup(
      createPreviewSykmeldt({
        previewSoknader: [
          createPreviewFremtidigSoknad({ id: "soknad-1" }),
          createPreviewNySoknad({ id: "soknad-2" }),
          createPreviewSendtSoknad({ id: "soknad-4", lest: false }),
          createPreviewSendtSoknad({ id: "soknad-4", lest: true }),
        ],
      }),
      [
        // soknad-2 above is new, and will be marked as read and cause a refetch
        markReadMock(vi.fn(), "soknad-2"),
        refetchCompleteMock(vi.fn()),
      ],
    );

    const fremtidigSection = within(
      screen.getByRole("region", { name: "Planlagte søknader" }),
    );
    expect(
      fremtidigSection.getAllByRole("button", { name: /Søknad/ }),
    ).toHaveLength(1);

    const nySection = within(
      screen.getByRole("region", { name: "Til utfylling" }),
    );
    expect(nySection.getAllByRole("button", { name: /Søknad/ })).toHaveLength(
      1,
    );

    const ulestSection = within(
      screen.getByRole("region", { name: "Uleste søknader" }),
    );
    expect(ulestSection.getAllByRole("link", { name: /Søknad/ })).toHaveLength(
      1,
    );

    const lestSection = within(
      screen.getByRole("region", { name: "Leste søknader" }),
    );
    expect(lestSection.getAllByRole("link", { name: /Søknad/ })).toHaveLength(
      1,
    );
  });

  it("should link to the correct path", () => {
    const sykmeldt = createPreviewSykmeldt({
      previewSoknader: [createPreviewSendtSoknad({ id: "soknad-1" })],
    });

    setup(sykmeldt, [
      createMock({
        request: { query: MineSykmeldteDocument },
        result: { data: { __typename: "Query", mineSykmeldte: [sykmeldt] } },
      }),
    ]);

    expect(screen.getByRole("link", { name: /Søknad/ })).toHaveAttribute(
      "href",
      "/sykmeldt/test-sykmeldt-id/soknad/soknad-1",
    );
  });

  it("should render in order of date, newest first", () => {
    setup(
      createPreviewSykmeldt({
        previewSoknader: [
          createPreviewSendtSoknad({
            id: "soknad-1",
            lest: true,
            fom: "2021-01-01",
            tom: "2021-01-05",
          }),
          createPreviewSendtSoknad({
            id: "soknad-2",
            lest: true,
            fom: "2020-01-01",
            tom: "2020-01-05",
          }),
          createPreviewSendtSoknad({
            id: "soknad-3",
            lest: true,
            fom: "2023-01-01",
            tom: "2023-01-05",
          }),
          createPreviewSendtSoknad({
            id: "soknad-4",
            lest: true,
            fom: "2022-01-01",
            tom: "2022-01-05",
          }),
        ],
      }),
    );

    const lestSection = within(
      screen.getByRole("region", { name: "Leste søknader" }),
    );
    const links = lestSection.getAllByRole("link", { name: /Søknad/ });

    expect(links).toHaveLength(4);
    expect(links[0]).toHaveTextContent("1. januar 2023 - 5. januar 2023");
    expect(links[1]).toHaveTextContent("1. januar 2022 - 5. januar 2022");
    expect(links[2]).toHaveTextContent("1. januar 2021 - 5. januar 2021");
    expect(links[3]).toHaveTextContent("1. januar 2020 - 5. januar 2020");
  });

  it("should mark one PreviewNySoknad with warning as read", async () => {
    const readComplete = vi.fn();
    const refetchComplete = vi.fn();

    const nySoknadUnreadWithWarning = [
      createPreviewNySoknad({
        id: "soknad-id",
        ikkeSendtSoknadVarsel: true,
        lest: false,
      }),
    ];

    setup(
      createPreviewSykmeldt({ previewSoknader: nySoknadUnreadWithWarning }),
      [
        markReadMock(readComplete, "soknad-id"),
        refetchCompleteMock(refetchComplete),
      ],
    );

    await waitFor(() => expect(readComplete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(refetchComplete).toHaveBeenCalled());
  });

  it("should mark two PreviewNySoknad with warning as read", async () => {
    const readComplete = vi.fn();
    const refetchComplete = vi.fn();
    const mocks = [
      markReadMock(readComplete, "soknad-id-1"),
      markReadMock(readComplete, "soknad-id-2"),
      refetchCompleteMock(refetchComplete),
    ];

    const nySoknadUnreadWithWarning = [
      createPreviewNySoknad({
        id: "soknad-id-1",
        ikkeSendtSoknadVarsel: true,
        lest: false,
      }),
      createPreviewNySoknad({
        id: "soknad-id-2",
        ikkeSendtSoknadVarsel: true,
        lest: false,
      }),
    ];

    setup(
      createPreviewSykmeldt({ previewSoknader: nySoknadUnreadWithWarning }),
      mocks,
    );

    await waitFor(() => expect(readComplete).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(refetchComplete).toHaveBeenCalled());
  });
});

function markReadMock(readComplete: Mock, soknadId: string): MockedResponse {
  return createMock({
    request: {
      query: MarkSoknadReadDocument,
      variables: { soknadId: soknadId },
    },
    result: () => {
      readComplete();
      return { data: { __typename: "Mutation" as const, read: true } };
    },
  });
}

function refetchCompleteMock(refetchComplete: Mock): MockedResponse {
  return createMock({
    request: { query: MineSykmeldteDocument },
    result: () => {
      refetchComplete();
      return { data: { __typename: "Query" as const, mineSykmeldte: [] } };
    },
  });
}
