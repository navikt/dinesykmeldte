import { logger } from "@navikt/next-logger";
import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "../../../auth/withAuthenticatedApiRoute";
import { createSsrApolloClient } from "../../../graphql/prefetching";
import { MarkHendelseResolvedDocument } from "../../../graphql/queries/graphql.generated";
import { isServerLogged } from "../../../graphql/resolvers/withBackendFailure";
import {
  logRequestRejected,
  logServerFailure,
} from "../../../observability/serverLog";

interface RequestBody {
  hendelseIds: string[];
}

async function handler(req: Request): Promise<NextResponse> {
  const resolverContextType = createAppRouterResolverContextType(req);
  if (!resolverContextType) {
    logServerFailure("missingAuthenticatedContext", undefined, {
      failure_stage: "authentication",
      outcome: "rejected",
    });

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    logRequestRejected("hendelser", "INVALID_JSON");

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.hendelseIds) || body.hendelseIds.length === 0) {
    logRequestRejected("hendelser", "INVALID_HENDELSE_IDS");

    return NextResponse.json(
      { error: "hendelseIds must be a non-empty array" },
      { status: 400 },
    );
  }

  logger.info(
    { count: body.hendelseIds.length },
    "Marking hendelser as resolved",
  );

  try {
    const client = createSsrApolloClient(req);
    await Promise.all(
      body.hendelseIds.map(async (hendelseId) => {
        const result = await client.mutate({
          mutation: MarkHendelseResolvedDocument,
          variables: { hendelseId },
        });
        if (result.errors) {
          throw result.errors[0];
        }
      }),
    );

    return NextResponse.json({ message: "Hendelser marked as resolved" });
  } catch (error: unknown) {
    if (!isServerLogged(error)) {
      logServerFailure("hendelserResolveFailed", error, {
        upstream: "dinesykmeldte-backend",
      });
    }

    return NextResponse.json(
      { error: "Failed to mark hendelser as resolved" },
      { status: 500 },
    );
  }
}

const authenticatedHandler = withAuthenticatedApiRoute(handler);

export { authenticatedHandler as POST };
