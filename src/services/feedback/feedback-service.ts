import { requestOboToken } from '@navikt/oasis'
import { createChildLogger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'

import { getServerEnv } from '../../utils/env'
import { ResolverContextType } from '../../graphql/resolvers/resolverTypes'

export async function feedback(feedback: object, context: ResolverContextType): Promise<boolean> {
    const serverEnv = getServerEnv()

    const childLogger = createChildLogger(context.xRequestId ?? 'missing')

    childLogger.info(`Submitting feedback to flexjar-backend`)

    const oboResult = await requestOboToken(context.accessToken, serverEnv.FLEXJAR_BACKEND_SCOPE)
    if (!oboResult.ok) {
        throw new Error(
            `Unable to exchange token for flex-syketilfelle token, requestId: ${context.xRequestId},reason: ${oboResult.error.message}`,
            {
                cause: oboResult.error,
            },
        )
    }

    const response = await fetch(`${serverEnv.FLEXJAR}/api/v1/feedback`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${oboResult.token}`,
            'Content-Type': 'application/json',
            'x-request-id': context.xRequestId ?? 'unknown',
        },
        body: JSON.stringify({ ...feedback, app: 'dinesykmeldte', segment: inferSegment(context.payload.pid) }),
    })

    if (response.status === 401) {
        throw new GraphQLError(`User has been logged out, requestId: ${context.xRequestId}`, {
            extensions: { code: 'UNAUTHENTICATED' },
        })
    }

    if (response.ok) {
        childLogger.info('Submitted feedback OK')
        return true
    }

    throw new Error(
        `Unable to submit feedback to flexjar-backend, requestId: ${context.xRequestId}, status: ${response.status} ${response.statusText}`,
    )
}

export function inferSegment(pid: string): string {
    const year = +pid.slice(4, 6)
    const century = year > 20 ? 1900 : 2000
    const fullYear = century + +year
    const currentYear = new Date().getFullYear()
    const age = currentYear - fullYear

    if (age > 69) return '69-∞'
    else if (age > 59) return '60-69'
    else if (age > 49) return '50-59'
    else if (age > 39) return '40-49'
    else if (age > 29) return '30-39'
    else if (age > 19) return '20-29'
    else if (age > 9) return '10-19'
    else return '0-9'
}
