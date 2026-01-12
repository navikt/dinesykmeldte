import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { GraphQLError } from "graphql/error";
import { logger } from "@navikt/next-logger";
import {
  createResolverContextType,
  withAuthenticatedApi,
} from "../../auth/withAuthentication";
import { ResolverContextType } from "../../graphql/resolvers/resolverTypes";
import schema from "../../graphql/schema";
import { getServerEnv } from "../../utils/env";

const server = new ApolloServer<ResolverContextType>({
  schema,
  logger,
});

export default withAuthenticatedApi(
  startServerAndCreateNextHandler(server, {
    context: async (req, res) => {
      res.setHeader("x-version", getServerEnv().RUNTIME_VERSION);

      const resolverContextType = createResolverContextType(req);

      if (!resolverContextType) {
        throw new GraphQLError("User not logged in", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return resolverContextType;
    },
  }),
);
