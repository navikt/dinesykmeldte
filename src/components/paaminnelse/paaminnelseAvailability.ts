import type { PaaminnelseStatus } from "../../services/paaminnelse/paaminnelseContract";

export type VisiblePaaminnelseStatus = Exclude<
  PaaminnelseStatus["status"],
  "SKJULT"
>;

export type PaaminnelseAvailability =
  | { kind: "pending" }
  | {
      kind: "hidden";
      reason: "status_error" | "not_available";
    }
  | { kind: "visible"; status: VisiblePaaminnelseStatus };

type AvailabilityInput = {
  hasContext: boolean;
  statusQuery: {
    data: PaaminnelseStatus | undefined;
    isLoading: boolean;
    isError: boolean;
  };
};

/** One decision shared by the UI and delivery telemetry. No fetching or effects. */
export function getPaaminnelseAvailability({
  hasContext,
  statusQuery,
}: AvailabilityInput): PaaminnelseAvailability {
  if (!hasContext) {
    return { kind: "pending" };
  }

  if (statusQuery.isLoading) {
    return { kind: "pending" };
  }

  const status = statusQuery.data?.status;
  if (!statusQuery.isError && status && status !== "SKJULT") {
    return { kind: "visible", status };
  }
  if (statusQuery.isError) {
    return { kind: "hidden", reason: "status_error" };
  }
  return { kind: "hidden", reason: "not_available" };
}
