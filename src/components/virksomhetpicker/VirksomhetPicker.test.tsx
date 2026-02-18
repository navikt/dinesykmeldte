import { waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import { describe, expect, it } from "vitest";
import { VirksomheterDocument } from "../../graphql/queries/graphql.generated";
import type { RootState } from "../../state/store";
import {
  createInitialQuery,
  createMock,
  createVirksomhet,
} from "../../utils/test/dataCreators";
import { render, screen, within } from "../../utils/test/testUtils";
import VirksomhetPicker from "./VirksomhetPicker";

describe("VirksomhetPicker", () => {
  it("should support user not having any virksomheter", async () => {
    render(<VirksomhetPicker />, {
      initialState: [
        createInitialQuery(VirksomheterDocument, {
          __typename: "Query",
          virksomheter: [],
        }),
      ],
    });

    expect(
      await screen.findByRole("option", { name: "Ingen virksomheter" }),
    ).toBeInTheDocument();
  });

  it("should support lazy loading virksomheter", async () => {
    const mocks = [
      createMock({
        request: { query: VirksomheterDocument },
        result: {
          data: {
            __typename: "Query",
            virksomheter: [
              createVirksomhet({ navn: "Virk 1", orgnummer: "virk-1" }),
              createVirksomhet({ navn: "Virk 2", orgnummer: "virk-2" }),
            ],
          },
        },
      }),
    ];

    render(<VirksomhetPicker />, { mocks });

    await waitForElementToBeRemoved(
      screen.queryByRole("option", { name: "Laster virksomheter..." }),
    );

    const combobox = within(
      screen.getByRole("combobox", { name: "Velg virksomhet" }),
    );
    const optionsInCombobox = combobox.getAllByRole("option");

    expect(optionsInCombobox[0]).toHaveValue("all");
    expect(optionsInCombobox[0]).toHaveTextContent("Alle virksomheter");
    expect(optionsInCombobox[1]).toHaveValue("virk-1");
    expect(optionsInCombobox[1]).toHaveTextContent("Virk 1");
    expect(optionsInCombobox[2]).toHaveValue("virk-2");
    expect(optionsInCombobox[2]).toHaveTextContent("Virk 2");
  });

  it("should update state when selecting", async () => {
    const AssertableVirksomhet = (): ReactElement => {
      const virksomhet = useSelector(
        (state: RootState) => state.filter.virksomhet,
      );
      return <div data-testid="virksomhet-output">{virksomhet}</div>;
    };

    render(
      <>
        <VirksomhetPicker />
        <AssertableVirksomhet />
      </>,
      {
        initialState: [
          createInitialQuery(VirksomheterDocument, {
            __typename: "Query",
            virksomheter: [
              createVirksomhet({ navn: "Virk 1", orgnummer: "virk-1" }),
              createVirksomhet({ navn: "Pick me", orgnummer: "pick-me" }),
            ],
          }),
        ],
      },
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Velg virksomhet" }),
      ["Pick me"],
    );

    expect(screen.getByTestId("virksomhet-output")).toHaveTextContent(
      "pick-me",
    );
  });
});
