import { ZodType } from 'zod';

import { PreviewSykmeldt, Soknad, Sykmelding } from '../../graphql/resolvers/resolvers.generated';
import { getToken } from '../../auth/tokenx';
import { logger } from '../../utils/logger';
import { getEnv } from '../../utils/env';

import { MineSykmeldteApiSchema, SoknadSchema, SykmeldingSchema } from './mineSykmeldteSchema';

export async function getMineSykmeldte(accessToken: string): Promise<PreviewSykmeldt[]> {
    return getMineSykmeldteBackend(accessToken, 'minesykmeldte', MineSykmeldteApiSchema);
}

export async function getSykmelding(sykmeldingId: string, accessToken: string): Promise<Sykmelding | null> {
    return getMineSykmeldteBackend(accessToken, `sykmelding/${sykmeldingId}`, SykmeldingSchema);
}

export async function getSoknad(soknadId: string, accessToken: string): Promise<Soknad | null> {
    return getMineSykmeldteBackend(accessToken, `soknad/${soknadId}`, SoknadSchema);
}

async function getMineSykmeldteBackend<T>(accessToken: string, path: string, schema: ZodType<T>): Promise<T> {
    const tokenX = await getToken(accessToken, getEnv('DINE_SYKMELDTE_BACKEND_SCOPE'));
    if (!tokenX) {
        throw new Error('Unable to exchange token for dinesykmeldte-backend token');
    }

    const response = await fetch(`${getEnv('DINE_SYKMELDTE_BACKEND_URL')}/api/${path}`, {
        method: 'GET',
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
        console.log(JSON.stringify(result.data));
        return result.data;
    }

    logger.error('Unable to parse API result');
    logger.error(result.error.message);
    throw new Error(`Result from API to path ${path} doesn't match the expected shape. ${result.error.message}`);
}
