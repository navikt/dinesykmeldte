import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { logger } from "@navikt/next-logger";
import { GraphQLError } from "graphql/error";
import {
  createAppRouterResolverContextType,
  withAuthenticatedAppRoute,
} from "../../../auth/withAuthenticatedAppRoute";
import type { ResolverContextType } from "../../../graphql/resolvers/resolverTypes";
import schema from "../../../graphql/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type GraphqlRouteContext = RouteContext<"/api/graphql">;

const server = new ApolloServer<ResolverContextType>({
  schema,
  logger,
});

const handler = startServerAndCreateNextHandler<Request, ResolverContextType>(
  server,
  {
    context: async (req) => {
      const resolverContextType = createAppRouterResolverContextType(req);

      if (!resolverContextType) {
        throw new GraphQLError("User not logged in", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return resolverContextType;
    },
  },
);

const authenticatedHandler = withAuthenticatedAppRoute<GraphqlRouteContext>(
  async (req) => handler(req),
);

export { authenticatedHandler as GET, authenticatedHandler as POST };
