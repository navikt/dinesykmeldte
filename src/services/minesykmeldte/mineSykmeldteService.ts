import { z, ZodTypeAny } from 'zod';

import { PreviewSykmeldt, ReadType, Soknad, Sykmelding, Virksomhet } from '../../graphql/resolvers/resolvers.generated';
import { getToken } from '../../auth/tokenx';
import { logger } from '../../utils/logger';
import { getEnv } from '../../utils/env';
import metrics from '../../metrics';

import {
    MessageResponseSchema,
    MineSykmeldteApiSchema,
    SoknadSchema,
    SykmeldingSchema,
    VirksomheterApiSchema,
} from './mineSykmeldteSchema';

const getMarkReadPath = (type: ReadType, id: string): string => {
    switch (type) {
        case ReadType.Hendelse:
            return `hendelse/${id}/lest`;
        case ReadType.Soknad:
            return `soknad/${id}/lest`;
        case ReadType.Sykmelding:
            return `sykmelding/${id}/lest`;
        case ReadType.Aktivitetsvarsel:
            return `aktivitetsvarsel/${id}/lest`;
    }
};

export async function markRead(type: ReadType, id: string, accessToken: string): Promise<boolean> {
    const [result, statusCode] = await fetchMineSykmeldteBackend({
        what: 'mark-read-mutation',
        accessToken,
        path: getMarkReadPath(type, id),
        schema: MessageResponseSchema,
        method: 'PUT',
    });

    logger.info(`Marking ${type} with id ${id} as read, resulted in: ${result.message}`);
    if (statusCode !== 200) {
        throw new Error(result.message);
    }

    return true;
}

export async function unlinkSykmeldt(sykmeldtId: string, accessToken: string): Promise<boolean> {
    const [result, statusCode] = await fetchMineSykmeldteBackend({
        what: 'unlink-mutation',
        accessToken,
        path: `narmesteleder/${sykmeldtId}/avkreft`,
        schema: MessageResponseSchema,
        method: 'POST',
    });

    logger.info(`Unlinking ${sykmeldtId} from nærmesteleder, resulted in ${result.message}`);
    if (statusCode !== 200) {
        throw new Error(result.message);
    }

    return true;
}

export async function getVirksomheter(accessToken: string): Promise<Virksomhet[]> {
    const [result] = await fetchMineSykmeldteBackend({
        what: 'virksomheter',
        accessToken,
        path: 'virksomheter',
        schema: VirksomheterApiSchema,
    });

    return result;
}

export async function getMineSykmeldte(accessToken: string): Promise<PreviewSykmeldt[]> {
    const [result] = await fetchMineSykmeldteBackend({
        what: 'sykmeldte',
        accessToken,
        path: 'minesykmeldte',
        schema: MineSykmeldteApiSchema,
    });

    return result;
}

export async function getSykmelding(sykmeldingId: string, accessToken: string): Promise<Sykmelding> {
    const [result] = await fetchMineSykmeldteBackend({
        what: 'sykmelding',
        accessToken,
        path: `sykmelding/${sykmeldingId}`,
        schema: SykmeldingSchema,
    });

    return result;
}

export async function getSoknad(soknadId: string, accessToken: string): Promise<Soknad> {
    const [result] = await fetchMineSykmeldteBackend({
        what: 'soknad',
        accessToken,
        path: `soknad/${soknadId}`,
        schema: SoknadSchema,
    });

    return result;
}

async function fetchMineSykmeldteBackend<SchemaType extends ZodTypeAny>({
    what,
    accessToken,
    path,
    schema,
    method = 'GET',
}: {
    what: string;
    accessToken: string;
    path: string;
    schema: SchemaType;
    method?: string;
}): Promise<[result: z.infer<SchemaType>, httpStatus: number]> {
    const tokenX = await getToken(accessToken, getEnv('DINE_SYKMELDTE_BACKEND_SCOPE'));
    if (!tokenX) {
        throw new Error('Unable to exchange token for dinesykmeldte-backend token');
    }

    const stopTimer = metrics.backendApiDurationHistogram.startTimer({ path: what });
    const response = await fetch(`${getEnv('DINE_SYKMELDTE_BACKEND_URL')}/api/${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${tokenX}`,
            'Content-Type': 'application/json',
        },
    });
    stopTimer();

    logger.info(`Backend API responded to path ${path} with ${response.status} ${response.statusText}`);
    if (response.status === 401) {
        throw new Error('Missing access to API');
    }

    const responseJson: unknown = await response.json();
    const result = schema.safeParse(responseJson);
    if (result.success) {
        return [result.data, response.status];
    }

    logger.error(`Unable to parse API result: ${result.error.message}`);
    throw new Error(`Result from API to path ${path} doesn't match the expected shape. ${result.error.message}`);
}
