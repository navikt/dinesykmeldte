import { describe, expect, it } from "vitest";
import type { TiltakspakkeGating } from "../../services/tiltakspakke/useTiltakspakkevurdering";
import { getPaaminnelseAvailability } from "./paaminnelseAvailability";

const vurdering: TiltakspakkeGating = {
  gruppe: "tiltak",
  erITiltaksgruppe: true,
  erVurderingFerdig: true,
};
const statusQuery = {
  data: { status: "TILGJENGELIG" as const },
  isLoading: false,
  isError: false,
};
const available = { hasContext: true, vurdering, statusQuery };

describe("Reminder availability", () => {
  it("waits for context, assignment and an enabled status query", () => {
    expect(
      getPaaminnelseAvailability({ ...available, hasContext: false }),
    ).toEqual({ kind: "pending" });
    expect(
      getPaaminnelseAvailability({
        ...available,
        vurdering: { ...vurdering, erVurderingFerdig: false },
      }),
    ).toEqual({ kind: "pending" });
    expect(
      getPaaminnelseAvailability({
        ...available,
        statusQuery: { ...statusQuery, data: undefined, isLoading: true },
      }),
    ).toEqual({ kind: "pending" });
  });

  it.each([
    "TILGJENGELIG",
    "BESTILT",
  ] as const)("exposes visible status %s", (status) => {
    expect(
      getPaaminnelseAvailability({
        ...available,
        statusQuery: { ...statusQuery, data: { status } },
      }),
    ).toEqual({ kind: "visible", status });
  });

  it.each([
    "kontroll",
    "utenfor_scope",
  ] as const)("does not wait for a disabled status query in %s", (gruppe) => {
    expect(
      getPaaminnelseAvailability({
        ...available,
        vurdering: { ...vurdering, gruppe, erITiltaksgruppe: false },
        statusQuery: { ...statusQuery, data: undefined, isLoading: true },
      }),
    ).toEqual({ kind: "hidden", reason: "not_available" });
  });

  it("keeps missing assignment distinct from a valid hidden status", () => {
    expect(
      getPaaminnelseAvailability({
        ...available,
        vurdering: { ...vurdering, gruppe: "ukjent", erITiltaksgruppe: false },
      }),
    ).toEqual({ kind: "hidden", reason: "missing_assignment" });
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
