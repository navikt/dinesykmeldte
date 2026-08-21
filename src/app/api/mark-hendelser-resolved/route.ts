import { logger } from "@navikt/next-logger";
import { NextResponse } from "next/server";
import {
  createAppRouterResolverContextType,
  withAuthenticatedApiRoute,
} from "../../../auth/withAuthenticatedApiRoute";
import { createSsrApolloClient } from "../../../graphql/prefetching";
import { MarkHendelseResolvedDocument } from "../../../graphql/queries/graphql.generated";

interface RequestBody {
  hendelseIds: string[];
}

async function handler(req: Request): Promise<NextResponse> {
  const resolverContextType = createAppRouterResolverContextType(req);
  if (!resolverContextType) {
    logger.error("User not logged in during mark-hendelser-resolved request");

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    logger.error("Failed to parse request body");

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.hendelseIds) || body.hendelseIds.length === 0) {
    logger.error(`Invalid hendelseIds: ${JSON.stringify(body.hendelseIds)}`);

    return NextResponse.json(
      { error: "hendelseIds must be a non-empty array" },
      { status: 400 },
    );
  }

  logger.info(
    `Marking the following hendelseIds as resolved: ${body.hendelseIds.join(", ")}`,
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
    logger.error(`Failed to mark hendelser as resolved: ${error}`);

    return NextResponse.json(
      { error: "Failed to mark hendelser as resolved" },
      { status: 500 },
    );
  }
}

const authenticatedHandler = withAuthenticatedApiRoute(handler);

export { authenticatedHandler as POST };
