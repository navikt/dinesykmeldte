import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { range } from "remeda";
import { describe, expect, it } from "vitest";
import type { PreviewSykmeldtFragment } from "../../../graphql/queries/graphql.generated";
import { createPreviewSykmeldt } from "../../../utils/test/dataCreators";
import { render, screen, within } from "../../../utils/test/testUtils";
import PaginatedSykmeldteList from "./PaginatedSykmeldteList";

describe("PaginatedSykmeldteList", () => {
  function setup(
    sykmeldte: PreviewSykmeldtFragment[],
    focusSykmeldtId: string | null = null,
  ): void {
    render(
      <PaginatedSykmeldteList
        sykmeldte={sykmeldte}
        focusSykmeldtId={focusSykmeldtId}
        showOrgHeading={false}
      />,
    );
  }

  it("should not paginate when exactly 5 sykmeldte", () => {
    setup([
      createPreviewSykmeldt({ narmestelederId: "1" }),
      createPreviewSykmeldt({ narmestelederId: "2" }),
      createPreviewSykmeldt({ narmestelederId: "3" }),
      createPreviewSykmeldt({ narmestelederId: "4" }),
      createPreviewSykmeldt({ narmestelederId: "5" }),
    ]);

    expect(
      screen.queryByRole("navigation", {
        name: "paginering av sykmeldte uten varsler",
      }),
    ).not.toBeInTheDocument();
  });

  it("should show pagination when more than 5 sykmeldte", () => {
    setup([
      createPreviewSykmeldt({ narmestelederId: "1" }),
      createPreviewSykmeldt({ narmestelederId: "2" }),
      createPreviewSykmeldt({ narmestelederId: "3" }),
      createPreviewSykmeldt({ narmestelederId: "4" }),
      createPreviewSykmeldt({ narmestelederId: "5" }),
      createPreviewSykmeldt({ narmestelederId: "6" }),
    ]);

    const region = screen.getByRole("navigation", {
      name: "paginering av sykmeldte uten varsler",
    });

    expect(region).toBeInTheDocument();
    expect(
      within(region).getByRole("button", { name: "Forrige" }),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("button", { name: "1" }),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("button", { name: "2" }),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("button", { name: "Neste" }),
    ).toBeInTheDocument();
  });

  describe("given someone to focus", () => {
    it("should expand and focus correct page", async () => {
      setup(
        [
          createPreviewSykmeldt({ narmestelederId: "1" }),
          createPreviewSykmeldt({ narmestelederId: "2" }),
          createPreviewSykmeldt({ narmestelederId: "3" }),
          createPreviewSykmeldt({ narmestelederId: "4" }),
          createPreviewSykmeldt({ narmestelederId: "5" }),
          createPreviewSykmeldt({ narmestelederId: "6" }),
        ],
        "6",
      );

      const region = screen.getByRole("navigation", {
        name: "paginering av sykmeldte uten varsler",
      });

      expect(region).toBeInTheDocument();
      await waitFor(() =>
        expect(
          within(region).getByRole("button", { name: "2" }),
        ).toHaveAttribute("aria-current", "true"),
      );
    });
  });

  describe("when filtering for page", () => {
    const sixSykmeldte = [
      createPreviewSykmeldt({ navn: "Normann 1", narmestelederId: "1" }),
      createPreviewSykmeldt({ navn: "Normann 2", narmestelederId: "2" }),
      createPreviewSykmeldt({ navn: "Normann 3", narmestelederId: "3" }),
      createPreviewSykmeldt({ navn: "Normann 4", narmestelederId: "4" }),
      createPreviewSykmeldt({ navn: "Normann 5", narmestelederId: "5" }),
      createPreviewSykmeldt({ navn: "Normann 6", narmestelederId: "6" }),
    ];

    const getSykmeldteNamesOnPage = (page: HTMLElement): (string | null)[] =>
      within(page)
        .getAllByRole("region")
        .map((it) => within(it).getByRole("heading"))
        .map((it) => it.textContent);

    it("should show correct sykmeldte on correct page 1", () => {
      setup(sixSykmeldte);

      const region = screen.getByRole("navigation", {
        name: "paginering av sykmeldte uten varsler",
      });

      expect(within(region).getByRole("button", { name: "1" })).toHaveAttribute(
        "aria-current",
        "true",
      );
      expect(within(region).getByRole("button", { name: "2" })).toHaveAttribute(
        "aria-current",
        "false",
      );

      const page = screen.getByRole("region", { name: "side 1 av sykmeldte" });
      expect(getSykmeldteNamesOnPage(page)).toEqual([
        "Normann 1",
        "Normann 2",
        "Normann 3",
        "Normann 4",
        "Normann 5",
      ]);
    });

    it("should show correct sykmeldte on correct page 2", async () => {
      setup(sixSykmeldte);

      const region = screen.getByRole("navigation", {
        name: "paginering av sykmeldte uten varsler",
      });
      await userEvent.click(
        within(region).getByRole("button", { name: "Neste" }),
      );

      expect(within(region).getByRole("button", { name: "1" })).toHaveAttribute(
        "aria-current",
        "false",
      );
      expect(within(region).getByRole("button", { name: "2" })).toHaveAttribute(
        "aria-current",
        "true",
      );

      const page = screen.getByRole("region", { name: "side 2 av sykmeldte" });
      expect(getSykmeldteNamesOnPage(page)).toEqual(["Normann 6"]);
    });

    it("should handle navigating with next/prev and number buttons", async () => {
      setup(sixSykmeldte);

      const assertFirstPage = (): void => {
        expect(
          within(region).getByRole("button", { name: "Forrige" }),
        ).toBeDisabled();
        expect(
          within(region).getByRole("button", { name: "Neste" }),
        ).not.toBeDisabled();
        expect(
          within(region).getByRole("button", { name: "1" }),
        ).toHaveAttribute("aria-current", "true");
        expect(
          within(region).getByRole("button", { name: "2" }),
        ).toHaveAttribute("aria-current", "false");
      };

      const assertSecondPage = (): void => {
        expect(
          within(region).getByRole("button", { name: "Forrige" }),
        ).not.toBeDisabled();
        expect(
          within(region).getByRole("button", { name: "Neste" }),
        ).toBeDisabled();
        expect(
          within(region).getByRole("button", { name: "1" }),
        ).toHaveAttribute("aria-current", "false");
        expect(
          within(region).getByRole("button", { name: "2" }),
        ).toHaveAttribute("aria-current", "true");
      };

      const region = screen.getByRole("navigation", {
        name: "paginering av sykmeldte uten varsler",
      });

      assertFirstPage();
      await userEvent.click(
        within(region).getByRole("button", { name: "Neste" }),
      );
      assertSecondPage();
      await userEvent.click(
        within(region).getByRole("button", { name: "Forrige" }),
      );
      assertFirstPage();
      await userEvent.click(within(region).getByRole("button", { name: "2" }));
      assertSecondPage();
      await userEvent.click(within(region).getByRole("button", { name: "1" }));
      assertFirstPage();
    });
  });

  it.each([
    [14, 3],
    [15, 3],
    [16, 4],
    [25, 5],
  ])("should create %i pages when %i sykmeldte", (sykmeldteCount, expectedPages) => {
    const sykmeldte: PreviewSykmeldtFragment[] = range(0, sykmeldteCount).map(
      (key) => createPreviewSykmeldt({ narmestelederId: `${key}` }),
    );

    setup(sykmeldte);

    const region = screen.getByRole("navigation", {
      name: "paginering av sykmeldte uten varsler",
    });
    const buttons = within(region)
      .getAllByRole("button")
      .slice(1, -1)
      .map((it) => it.textContent);

    expect(buttons).toEqual(range(0, expectedPages).map((key) => `${key + 1}`));
  });

  it.each([
    [99, 20, ["1", "2", "3", "20"]],
    [1001, 201, ["1", "2", "3", "201"]],
  ])("should truncate to 3 pages when %i for %i sykmeldte", (sykmeldteCount, expectedPages, expectedResult) => {
    const sykmeldte: PreviewSykmeldtFragment[] = range(0, sykmeldteCount).map(
      (key) => createPreviewSykmeldt({ narmestelederId: `${key}` }),
    );

    setup(sykmeldte);

    const region = screen.getByRole("navigation", {
      name: "paginering av sykmeldte uten varsler",
    });
    const buttons = within(region)
      .getAllByRole("button")
      .slice(1, -1)
      .map((it) => it.textContent);

    expect(buttons).toEqual(expectedResult);
  });
});
