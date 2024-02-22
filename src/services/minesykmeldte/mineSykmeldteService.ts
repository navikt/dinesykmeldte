import { z, ZodTypeAny } from 'zod'
import { requestOboToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'

import { PreviewSykmeldt, ReadType, Soknad, Sykmelding, Virksomhet } from '../../graphql/resolvers/resolvers.generated'
import { getServerEnv } from '../../utils/env'
import metrics from '../../metrics'
import { ResolverContextType } from '../../graphql/resolvers/resolverTypes'

import { SykmeldingSchema } from './schema/sykmelding'
import { SoknadSchema } from './schema/soknad'
import { VirksomheterApiSchema } from './schema/virksomhet'
import { MineSykmeldteApiSchema } from './schema/sykmeldt'
import { MessageResponseSchema } from './schema/common'

const getMarkReadPath = (type: ReadType, id: string): string => {
    switch (type) {
        case ReadType.Hendelse:
        case ReadType.Aktivitetsvarsel:
            return `hendelse/${id}/lest`
        case ReadType.Soknad:
            return `soknad/${id}/lest`
        case ReadType.Sykmelding:
            return `sykmelding/${id}/lest`
    }
}

export async function markRead(type: ReadType, id: string, context: ResolverContextType): Promise<boolean> {
    const [result, statusCode] = await fetchMineSykmeldteBackend({
        what: 'mark-read-mutation',
        context,
        path: getMarkReadPath(type, id),
        schema: MessageResponseSchema,
        method: 'PUT',
    })

    logger.info(`Marking ${type} with id ${id} as read, resulted in: ${result.message}`)
    if (statusCode !== 200) {
        throw new Error(result.message)
    }

    return true
}

export async function unlinkSykmeldt(sykmeldtId: string, context: ResolverContextType): Promise<boolean> {
    const [result, statusCode] = await fetchMineSykmeldteBackend({
        what: 'unlink-mutation',
        context,
        path: `narmesteleder/${sykmeldtId}/avkreft`,
        schema: MessageResponseSchema,
        method: 'POST',
    })

    logger.info(`Unlinking ${sykmeldtId} from nærmesteleder, resulted in ${result.message}`)
    if (statusCode !== 200) {
        throw new Error(result.message)
    }

    return true
}

export async function markAllSykmeldingerAndSoknaderAsRead(context: ResolverContextType): Promise<boolean> {
    const [result, statusCode] = await fetchMineSykmeldteBackend({
        what: 'mark-all-sykmeldinger-and-soknader-as-read-mutation',
        context,
        path: 'hendelser/read',
        schema: MessageResponseSchema,
        method: 'PUT',
    })
    logger.info(`Mark all sykmeldinger and soknader as read for nærmesteleder, result in ${result.message}`)
    if (statusCode !== 200) {
        throw new Error(result.message)
    }

    return true
}

export async function getVirksomheter(context: ResolverContextType): Promise<Virksomhet[]> {
    const [result] = await fetchMineSykmeldteBackend({
        what: 'virksomheter',
        context,
        path: 'virksomheter',
        schema: VirksomheterApiSchema,
    })

    return result
}

export async function getMineSykmeldte(context: ResolverContextType): Promise<PreviewSykmeldt[]> {
    logger.info(`Fetching mine sykmeldte from backend requestId ${context.xRequestId}`)
    const [result] = await fetchMineSykmeldteBackend({
        what: 'sykmeldte',
        context,
        path: 'minesykmeldte',
        schema: MineSykmeldteApiSchema,
    })

    return result
}

export async function getSykmelding(sykmeldingId: string, context: ResolverContextType): Promise<Sykmelding> {
    const [result] = await fetchMineSykmeldteBackend({
        what: 'sykmelding',
        context,
        path: `sykmelding/${sykmeldingId}`,
        schema: SykmeldingSchema,
    })

    return result
}

export async function getSoknad(soknadId: string, context: ResolverContextType): Promise<Soknad> {
    const [result] = await fetchMineSykmeldteBackend({
        what: 'soknad',
        context,
        path: `soknad/${soknadId}`,
        schema: SoknadSchema,
    })

    return result
}

async function fetchMineSykmeldteBackend<SchemaType extends ZodTypeAny>({
    what,
    context,
    path,
    schema,
    method = 'GET',
}: {
    what: string
    context: ResolverContextType
    path: string
    schema: SchemaType
    method?: string
}): Promise<[result: z.infer<SchemaType>, httpStatus: number]> {
    const oboResult = await requestOboToken(context.accessToken, getServerEnv().DINE_SYKMELDTE_BACKEND_SCOPE)
    if (!oboResult.ok) {
        throw new Error(
            `Unable to exchange token for dinesykmeldte-backend token, reason: ${oboResult.error.message}`,
            { cause: oboResult.error },
        )
    }

    const stopTimer = metrics.backendApiDurationHistogram.startTimer({ path: what })
    const response = await fetch(`${getServerEnv().DINE_SYKMELDTE_BACKEND_URL}/api/${path}`, {
        method,
        headers: {
            'x-request-id': context.xRequestId ?? 'unknown',
            Authorization: `Bearer ${oboResult.token}`,
            'Content-Type': 'application/json',
        },
    })
    stopTimer()

    if (response.status === 401) {
        throw new Error(`Users access to API on path ${path} has expired`)
    }

    if (!response.ok) {
        throw new Error(
            `Unknown error from DineSykmeldte Backend, responded with ${response.status} ${response.statusText} when fetching ${path}`,
        )
    }

    const responseJson = await getJsonBody(response)
    const result = schema.safeParse(responseJson)
    if (result.success) {
        logger.info(
            `Successful zod parse, backend API responded to path ${path} with ${response.status} ${response.statusText}`,
        )
        return [result.data, response.status]
    }

    throw new Error(
        `Unable to parse API result, backend responded with: ${response.status} ${response.statusText}, parse error: ${result.error.message}`,
    )
}

async function getJsonBody(response: Response): Promise<unknown> {
    try {
        return await response.json()
    } catch (e) {
        throw new Error(
            `Backend responded with ${response.status} ${
                response.statusText
            }, but didn't respond with JSON, text response: ${await response.text()}`,
        )
    }
}
