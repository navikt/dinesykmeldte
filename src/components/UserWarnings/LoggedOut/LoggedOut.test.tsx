import { describe, expect, it } from "vitest";
import metadataSlice from "../../../state/metadataSlice";
import { createTestStore, render, screen } from "../../../utils/test/testUtils";
import LoggedOut from "./LoggedOut";

describe("app wrapper", () => {
  it("should warn user when logged out", async () => {
    const store = createTestStore();
    store.dispatch(metadataSlice.actions.setLoggedOut());

    render(<LoggedOut />, { store });

    expect(
      screen.getByRole("dialog", { name: "Du har blitt logget ut" }),
    ).toBeInTheDocument();
  });

  it("should NOT warn user when NOT logged out", () => {
    const store = createTestStore();

    render(<LoggedOut />, { store });

    expect(
      screen.queryByRole("dialog", { name: "Du har blitt logget ut" }),
    ).not.toBeInTheDocument();
  });
});
