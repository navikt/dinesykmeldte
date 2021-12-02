import { ApolloServer, AuthenticationError } from 'apollo-server-micro';

import schema from '../../graphql/schema';
import { createResolverContextType, withAuthenticatedApi } from '../../auth/withAuthentication';
import { logger } from '../../utils/logger';
import { ResolverContextType } from '../../graphql/resolvers/resolverTypes';

const apolloServer = new ApolloServer({
    schema,
    context: async ({ req }): Promise<ResolverContextType> => {
        const resolverContextType = createResolverContextType(req);

        if (!resolverContextType) {
            throw new AuthenticationError('User not logged in');
        }

        return resolverContextType;
    },
    logger,
});

export const config = {
    api: { bodyParser: false },
};

const startServer = apolloServer.start();
export default withAuthenticatedApi(async (req, res) => {
    await startServer;
    await apolloServer.createHandler({
        path: '/api/graphql',
    })(req, res);
});
