import { describe, expect, it } from "vitest";
import { getPaaminnelseAvailability } from "./paaminnelseAvailability";

const statusQuery = {
  data: { status: "TILGJENGELIG" as const },
  isLoading: false,
  isError: false,
};
const available = { hasContext: true, statusQuery };

describe("Reminder availability", () => {
  it("waits for context and the status query", () => {
    expect(
      getPaaminnelseAvailability({ ...available, hasContext: false }),
    ).toEqual({ kind: "pending" });
    expect(
      getPaaminnelseAvailability({
        ...available,
        statusQuery: { ...statusQuery, data: undefined, isLoading: true },
      }),
    ).toEqual({ kind: "pending" });
  });

  it.each(["TILGJENGELIG", "BESTILT"] as const)(
    "exposes visible status %s",
    (status) => {
      expect(
        getPaaminnelseAvailability({
          ...available,
          statusQuery: { ...statusQuery, data: { status } },
        }),
      ).toEqual({ kind: "visible", status });
    },
  );

  it("hides the reminder when the status is SKJULT", () => {
    expect(
      getPaaminnelseAvailability({
        ...available,
        statusQuery: { ...statusQuery, data: { status: "SKJULT" } },
      }),
    ).toEqual({ kind: "hidden", reason: "not_available" });
  });

  it("hides stale successful data when the status query has failed", () => {
    expect(
      getPaaminnelseAvailability({
        ...available,
        statusQuery: { ...statusQuery, isError: true },
      }),
    ).toEqual({ kind: "hidden", reason: "status_error" });
  });
});
