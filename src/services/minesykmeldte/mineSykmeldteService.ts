import { z, ZodTypeAny } from 'zod';

import { PreviewSykmeldt, ReadType, Soknad, Sykmelding, Virksomhet } from '../../graphql/resolvers/resolvers.generated';
import { getToken } from '../../auth/tokenx';
import { logger } from '../../utils/logger';
import { getEnv } from '../../utils/env';

import {
    MessageResponseSchema,
    MineSykmeldteApiSchema,
    SoknadSchema,
    SykmeldingSchema,
    VirksomheterApiSchema,
} from './mineSykmeldteSchema';

export async function markRead(type: ReadType, id: string, accessToken: string): Promise<boolean> {
    const result = await fetchMineSykmeldteBackend({
        accessToken,
        path: `sykmelding/${id}/lest`,
        schema: MessageResponseSchema,
        method: 'PUT',
    });

    logger.info(`Marking ${type} with id ${id} as read, resulted in: ${result.message}`);

    return true;
}

export async function unlinkSykmeldt(sykmeldtId: string, accessToken: string): Promise<boolean> {
    const result = await fetchMineSykmeldteBackend({
        accessToken,
        path: `narmesteleder/${sykmeldtId}/avkreft`,
        schema: MessageResponseSchema,
        method: 'POST',
    });

    logger.info(`Unlinking ${sykmeldtId} from nærmesteleder, resulted in ${result.message}`);

    return true;
}

export async function getVirksomheter(accessToken: string): Promise<Virksomhet[]> {
    return fetchMineSykmeldteBackend({ accessToken, path: 'virksomheter', schema: VirksomheterApiSchema });
}

export async function getMineSykmeldte(accessToken: string): Promise<PreviewSykmeldt[]> {
    return fetchMineSykmeldteBackend({ accessToken, path: 'minesykmeldte', schema: MineSykmeldteApiSchema });
}

export async function getSykmelding(sykmeldingId: string, accessToken: string): Promise<Sykmelding> {
    return fetchMineSykmeldteBackend({ accessToken, path: `sykmelding/${sykmeldingId}`, schema: SykmeldingSchema });
}

export async function getSoknad(soknadId: string, accessToken: string): Promise<Soknad> {
    return fetchMineSykmeldteBackend({ accessToken, path: `soknad/${soknadId}`, schema: SoknadSchema });
}

async function fetchMineSykmeldteBackend<SchemaType extends ZodTypeAny>({
    accessToken,
    path,
    schema,
    method = 'GET',
}: {
    accessToken: string;
    path: string;
    schema: SchemaType;
    method?: string;
}): Promise<z.infer<SchemaType>> {
    const tokenX = await getToken(accessToken, getEnv('DINE_SYKMELDTE_BACKEND_SCOPE'));
    if (!tokenX) {
        throw new Error('Unable to exchange token for dinesykmeldte-backend token');
    }

    const response = await fetch(`${getEnv('DINE_SYKMELDTE_BACKEND_URL')}/api/${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${tokenX}`,
            'Content-Type': 'application/json',
        },
    });

    logger.info(`Backend API responded to path ${path} with ${response.status} ${response.statusText}`);
    if (response.status === 401) {
        throw new Error('Missing access to API');
    }

    const responseJson: unknown = await response.json();
    const result = schema.safeParse(responseJson);
    if (result.success) {
        return result.data;
    }

    logger.error('Unable to parse API result');
    logger.error(result.error.message);
    throw new Error(`Result from API to path ${path} doesn't match the expected shape. ${result.error.message}`);
}
