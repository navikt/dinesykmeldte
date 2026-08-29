import { logger } from "@navikt/next-logger";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MarkAllSykmeldingerAndSoknaderAsReadDocument,
  MineSykmeldteDocument,
} from "../../../graphql/queries/graphql.generated";
import {
  createInitialQuery,
  createMock,
} from "../../../utils/test/dataCreators";
import { render, screen, waitFor } from "../../../utils/test/testUtils";
import MarkAllAsReadModal from "./MarkAllAsReadModal";

describe("MarkAllAsReadModal", () => {
  it("keeps the modal open and reports refetch failure once", async () => {
    const onClose = vi.fn();
    const loggerErrorSpy = vi
      .spyOn(logger, "error")
      .mockImplementation(() => undefined);
    const loggerInfoSpy = vi
      .spyOn(logger, "info")
      .mockImplementation(() => undefined);

    render(<MarkAllAsReadModal isModalOpen onClose={onClose} />, {
      initialState: [
        createInitialQuery(MineSykmeldteDocument, {
          __typename: "Query",
          mineSykmeldte: [],
        }),
      ],
      mocks: [
        createMock({
          request: { query: MarkAllSykmeldingerAndSoknaderAsReadDocument },
          result: {
            data: {
              __typename: "Mutation",
              markAllSykmeldingerAndSoknaderAsRead: true,
            },
          },
        }),
        createMock({
          request: { query: MineSykmeldteDocument },
          error: new Error("refetch failed"),
        }),
      ],
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Ok, merk som lest!" }),
    );

    await waitFor(() => expect(loggerErrorSpy).toHaveBeenCalledOnce());
    expect(onClose).not.toHaveBeenCalled();
    expect(loggerInfoSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", {
        name: "Du er på vei til å merke varsler som lest",
      }),
    ).toBeInTheDocument();
  });
});
