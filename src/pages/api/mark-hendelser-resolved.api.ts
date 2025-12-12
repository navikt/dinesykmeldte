import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@navikt/next-logger'

import { createResolverContextType, withAuthenticatedApi } from '../../auth/withAuthentication'
import { MarkHendelseResolvedDocument } from '../../graphql/queries/graphql.generated'
import { createSsrApolloClient } from '../../graphql/prefetching'

interface RequestBody {
    hendelseIds: string[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    const resolverContextType = createResolverContextType(req)
    if (!resolverContextType) {
        logger.error('User not logged in during mark-hendelser-resolved')
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    let body: RequestBody
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch {
        logger.error('Failed to parse request body')
        res.status(400).json({ error: 'Invalid request body' })
        return
    }

    const { hendelseIds } = body

    if (!Array.isArray(hendelseIds) || hendelseIds.length === 0) {
        logger.error(`Invalid hendelseIds: ${JSON.stringify(hendelseIds)}`)
        res.status(400).json({ error: 'hendelseIds must be a non-empty array' })
        return
    }

    logger.info(`Marking the following hendelseIds as resolved: ${hendelseIds.join(', ')}`)

    try {
        const client = createSsrApolloClient(req)
        await Promise.all(
            hendelseIds.map(async (hendelseId) => {
                const result = await client.mutate({
                    mutation: MarkHendelseResolvedDocument,
                    variables: { hendelseId },
                })
                if (result.errors) {
                    throw result.errors[0]
                }
            }),
        )

        logger.info(`Successfully marked ${hendelseIds.length} hendelser as resolved`)
        res.status(200).json({ success: true })
    } catch (error: unknown) {
        logger.error(`Failed to mark hendelser as resolved: ${error}`)
        res.status(500).json({ error: 'Failed to mark hendelser as resolved' })
    }
}

export default withAuthenticatedApi(handler)
