import { ApolloServer, AuthenticationError } from 'apollo-server-micro';

import { schema } from '../../graphql/schema';
import { createResolverContextType, withAuthenticatedApi } from '../../auth/withAuthantication';
import { logger } from '../../utils/logger';
import { ResolverContextType } from '../../graphql/resolvers/resolverTypes';

const apolloServer = new ApolloServer({
    schema,
    playground: {
        settings: {
            'request.credentials': 'include',
        },
    },
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
    api: {
        bodyParser: false,
    },
};

export default withAuthenticatedApi(apolloServer.createHandler({ path: '/api/graphql' }));
