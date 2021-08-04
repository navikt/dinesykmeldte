import { ApolloServer, AuthenticationError } from 'apollo-server-micro';

import { schema } from '../../graphql/schema';
import { applySession, pullTokenSetFromRequest, withAuthenticatedApi } from '../../auth/withSession';
import { logger } from '../../utils/logger';

const apolloServer = new ApolloServer({
    schema,
    playground: {
        settings: {
            'request.credentials': 'include',
        },
    },
    context: async ({ req, res }) => {
        await applySession(req, res);

        const tokenSet = pullTokenSetFromRequest(req);

        if (!tokenSet) {
            throw new AuthenticationError('User not logged in');
        }

        return { tokenSet: tokenSet };
    },
    logger,
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default withAuthenticatedApi(apolloServer.createHandler({ path: '/api/graphql' }));
