import { z } from 'zod';

import { PreviewSykmeldt } from '../graphql/resolvers/resolvers.generated';
import { getToken } from '../auth/tokenx';
import { logger } from '../utils/logger';
import { getEnv } from '../utils/env';

import { LocalDateSchema, PreviewSoknadSchema, PreviewSykmeldingSchema } from './commonApiSchema';

const MineSykmeldteApiSchema = z.array(
    z.object({
        narmestelederId: z.string(),
        orgnummer: z.string(),
        fnr: z.string(),
        navn: z.string(),
        startdatoSykefravaer: LocalDateSchema,
        friskmeldt: z.boolean(),
        previewSykmeldinger: z.array(PreviewSykmeldingSchema),
        previewSoknader: z.array(PreviewSoknadSchema),
    }),
);

export async function getMineSykmeldte(accessToken: string): Promise<PreviewSykmeldt[]> {
    const tokenX = await getToken(accessToken, getEnv('DINE_SYKMELDTE_BACKEND_SCOPE'));

    if (!tokenX) {
        throw new Error('Unable to exchange token for dinesykmeldte-backend token');
    }

    return fetchMineSykmeldte(tokenX);
}

async function fetchMineSykmeldte(token: string): Promise<PreviewSykmeldt[]> {
    logger.info(`Getting mine sykmeldte, token is ${token.length}`);

    const response = await fetch(`${getEnv('DINE_SYKMELDTE_BACKEND_URL')}/api/minesykmeldte`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    logger.info(`Backend API responded with ${response.status} ${response.statusText}`);

    const responseJson: unknown = await response.json();
    const parseResult = MineSykmeldteApiSchema.safeParse(responseJson);
    if (parseResult.success) {
        return parseResult.data;
    }

    logger.error('Unable to parse API result');
    logger.error(parseResult.error.message);
    throw new Error(`Result from API doesn't match the expected shape. ${parseResult.error.message}`);
}
