import { ApolloServer, AuthenticationError } from 'apollo-server-micro';
import {
    ApolloServerPluginLandingPageDisabled,
    ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { logger } from '@navikt/next-logger';

import schema from '../../graphql/schema';
import { createResolverContextType, withAuthenticatedApi } from '../../auth/withAuthentication';
import { ResolverContextType } from '../../graphql/resolvers/resolverTypes';
import { getEnv } from '../../utils/env';

const apolloServer = new ApolloServer({
    schema,
    context: async ({ req, res }): Promise<ResolverContextType> => {
        res.setHeader('x-version', getEnv('RUNTIME_VERSION'));

        const resolverContextType = createResolverContextType(req);

        if (!resolverContextType) {
            throw new AuthenticationError('User not logged in');
        }

        return resolverContextType;
    },
    plugins: [
        process.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
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
