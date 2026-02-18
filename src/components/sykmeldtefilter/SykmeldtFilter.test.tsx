import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import { describe, expect, it } from "vitest";
import {
  MineSykmeldteDocument,
  type PreviewSykmeldtFragment,
  VirksomheterDocument,
} from "../../graphql/queries/graphql.generated";
import type { RootState } from "../../state/store";
import {
  createInitialQuery,
  createPreviewSykmeldt,
  createVirksomhet,
} from "../../utils/test/dataCreators";
import { render, screen } from "../../utils/test/testUtils";
import SykmeldteFilter from "./SykmeldteFilter";

const AssertableFilterValues = (): ReactElement => {
  const filter = useSelector((state: RootState) => state.filter);
  return (
    <>
      <div data-testid="name-output">{filter.name}</div>
      <div data-testid="show-output">{filter.show}</div>
      <div data-testid="sortBy-output">{filter.sortBy}</div>
    </>
  );
};

describe("SykmeldtFilter", () => {
  function setup(sykmeldte: PreviewSykmeldtFragment[]): void {
    const initialState = [
      createInitialQuery(MineSykmeldteDocument, {
        __typename: "Query",
        mineSykmeldte: sykmeldte,
      }),
      createInitialQuery(VirksomheterDocument, {
        __typename: "Query",
        virksomheter: [createVirksomhet()],
      }),
    ];

    render(
      <>
        <AssertableFilterValues />
        <SykmeldteFilter />
      </>,
      { initialState },
    );
  }

  it("should update context with new values", async () => {
    setup([
      createPreviewSykmeldt({ fnr: "1", orgnummer: "123456789" }),
      createPreviewSykmeldt({ fnr: "2", orgnummer: "123456789" }),
      createPreviewSykmeldt({ fnr: "3", orgnummer: "123456789" }),
      createPreviewSykmeldt({ fnr: "4", orgnummer: "123456789" }),
      createPreviewSykmeldt({ fnr: "5", orgnummer: "123456789" }),
    ]);

    const name = screen.getByRole("textbox", { name: "Søk på navn" });
    const display = screen.getByRole("combobox", { name: "Vis" });
    const sortBy = screen.getByRole("combobox", { name: "Sorter etter" });

    await userEvent.type(name, "Hello Filter");
    await userEvent.selectOptions(display, ["Sykmeldte"]);
    await userEvent.selectOptions(sortBy, ["Navn"]);

    expect(name).toHaveValue("Hello Filter");
    expect(display).toHaveValue("sykmeldte");
    expect(sortBy).toHaveValue("name");
  });
});
