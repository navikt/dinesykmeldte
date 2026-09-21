import { GraphQLError } from "graphql";
import { logServerFailure } from "../../observability/serverLog";

type BackendFailureEvent =
  | "virksomheterFetchFailed"
  | "mineSykmeldteFetchFailed"
  | "sykmeldingFetchFailed"
  | "soknadFetchFailed"
  | "readFailed"
  | "unlinkSykmeldtFailed"
  | "markAllReadFailed";

/** One server-side diagnosis before GraphQL removes the technical cause. */
export async function withBackendFailure<T>(
  event: BackendFailureEvent,
  resolve: () => Promise<T>,
): Promise<T> {
  try {
    return await resolve();
  } catch (error) {
    logServerFailure(event, error, { upstream: "dinesykmeldte-backend" });
    // Apollo and the browser must never receive raw upstream errors or token metadata.
    throw new GraphQLError("Backend request failed", {
      extensions: { code: "INTERNAL_SERVER_ERROR", serverLogged: true },
    });
  }
}
