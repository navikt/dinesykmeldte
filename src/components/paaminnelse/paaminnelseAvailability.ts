import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";
import type { TiltakspakkeGating } from "../../services/tiltakspakke/useTiltakspakkevurdering";

export type VisiblePaaminnelseStatus = Exclude<
  PaaminnelseStatus["status"],
  "SKJULT"
>;

export type PaaminnelseAvailability =
  | { kind: "pending" }
  | {
      kind: "hidden";
      reason: "missing_assignment" | "status_error" | "not_available";
    }
  | { kind: "visible"; status: VisiblePaaminnelseStatus };

type AvailabilityInput = {
  hasContext: boolean;
  vurdering: TiltakspakkeGating;
  statusQuery: {
    data: PaaminnelseStatus | undefined;
    isLoading: boolean;
    isError: boolean;
  };
};

/** One decision shared by the UI and delivery telemetry. No fetching or effects. */
export function getPaaminnelseAvailability({
  hasContext,
  vurdering,
  statusQuery,
}: AvailabilityInput): PaaminnelseAvailability {
  if (!hasContext || !vurdering.erVurderingFerdig) {
    return { kind: "pending" };
  }

  // The status query is disabled outside treatment; don't wait for it there.
  if (vurdering.erITiltaksgruppe && statusQuery.isLoading) {
    return { kind: "pending" };
  }

  const status = statusQuery.data?.status;
  if (
    vurdering.erITiltaksgruppe &&
    !statusQuery.isError &&
    status &&
    status !== "SKJULT"
  ) {
    return { kind: "visible", status };
  }
  if (vurdering.gruppe === "ukjent") {
    return { kind: "hidden", reason: "missing_assignment" };
  }
  if (statusQuery.isError) {
    return { kind: "hidden", reason: "status_error" };
  }
  return { kind: "hidden", reason: "not_available" };
}
