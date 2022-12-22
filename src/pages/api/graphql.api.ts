import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'

import schema from '../../graphql/schema'
import { createResolverContextType, withAuthenticatedApi } from '../../auth/withAuthentication'
import { getEnv } from '../../utils/env'
import { ResolverContextType } from '../../graphql/resolvers/resolverTypes'

const server = new ApolloServer<ResolverContextType>({
    schema,
    logger,
})

export default withAuthenticatedApi(
    startServerAndCreateNextHandler(server, {
        context: async (req, res) => {
            res.setHeader('x-version', getEnv('RUNTIME_VERSION'))

            const resolverContextType = createResolverContextType(req)

            if (!resolverContextType) {
                throw new GraphQLError('User not logged in', {
                    extensions: { code: 'UNAUTHENTICATED' },
                })
            }

            return resolverContextType
        },
    }),
)
