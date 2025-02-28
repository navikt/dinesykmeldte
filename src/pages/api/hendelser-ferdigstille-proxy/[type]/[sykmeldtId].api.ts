import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@navikt/next-logger'

import { isLocalOrDemo } from '../../../../utils/env'
import { createResolverContextType, withAuthenticatedApi } from '../../../../auth/withAuthentication'
import { MarkHendelseResolvedDocument } from '../../../../graphql/queries/graphql.generated'
import { createSsrApolloClient } from '../../../../graphql/prefetching'

function logAndRedirect500(message: string, res: NextApiResponse): void {
    logger.error(message)
    res.redirect('/500')
}

type HendelsesType = 'dialogmote' | 'oppfolgingsplan'

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const { sykmeldtId, type, source } = req.query
    const queryParams = (req.query.hendelser ?? null) as null | string | string[]

    if (!isValidQueryParams(queryParams)) {
        logAndRedirect500(`Malformed query params: ${JSON.stringify(queryParams)}`, res)
        return
    }

    if (!(type === 'dialogmote' || type === 'oppfolgingsplan')) {
        logAndRedirect500(`Invalid type: ${type}`, res)
        return
    }

    if (typeof sykmeldtId !== 'string') {
        logAndRedirect500(`Malformed sykmeldtId: ${sykmeldtId}, typeof: ${typeof sykmeldtId}`, res)
        return
    }

    const resolverContextType = createResolverContextType(req)
    if (!resolverContextType) {
        throw new Error('Illegal state: User not logged in during hendelse proxy.')
    }

    if (queryParams == null) {
        logger.info(`No hendelseIds to resolve. Redirecting directly.`)
        res.redirect(getRedirectUrl(sykmeldtId, type, source))
        return
    }

    logger.info(
        `Marking the following hendelseIds as resolved: ${
            typeof queryParams === 'string' ? queryParams : queryParams.join(', ')
        }`,
    )
    try {
        const hendelseIds = typeof queryParams === 'string' ? [queryParams] : queryParams
        await Promise.all(hendelseIds.map((hendelseId) => markHendelseResolved(hendelseId, req)))
    } catch (error: unknown) {
        logger.error(error)
        res.redirect('/500')
        return
    }

    res.redirect(getRedirectUrl(sykmeldtId, type, source))
}

function getRedirectUrl(sykmeldtId: string, type: HendelsesType, source?: string | string[]): string {
    if (type === 'dialogmote') {
        return getDialogmoterUrl(sykmeldtId) + createQueryParamIfPresent(source)
    } else if (type === 'oppfolgingsplan') {
        return getOppfolgingsplanUrl(sykmeldtId) + createQueryParamIfPresent(source)
    }

    throw new Error(`${type} is not a valid hendelse`)
}

function createQueryParamIfPresent(source?: string | string[]): string {
    if (!source) return ''

    if (Array.isArray(source)) {
        return `?source=${source.join('&source=')}`
    } else {
        return `?source=${source}`
    }
}
function getDialogmoterUrl(narmestelederId: string): string {
    if (isLocalOrDemo) {
        return `https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/${narmestelederId}`
    } else {
        return `/syk/dialogmoter/arbeidsgiver/${narmestelederId}`
    }
}

function isValidQueryParams(hendelser: string | string[] | null): hendelser is string[] | string | null {
    return hendelser === null || typeof hendelser === 'string' || Array.isArray(hendelser)
}

export function getOppfolgingsplanUrl(narmestelederId: string): string {
    if (isLocalOrDemo) {
        return `https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/${narmestelederId}`
    }

    return `/syk/oppfolgingsplaner/arbeidsgiver/${narmestelederId}`
}

async function markHendelseResolved(
    hendelseId: string,
    request: GetServerSidePropsContext['req'] | NextApiRequest,
): Promise<void> {
    const client = createSsrApolloClient(request)
    const result = await client.mutate({ mutation: MarkHendelseResolvedDocument, variables: { hendelseId } })

    if (result.errors) {
        throw result.errors[0]
    }
}

export default withAuthenticatedApi(handler)
