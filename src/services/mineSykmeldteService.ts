import { Sykmeldt } from '../graphql/resolvers/resolvers.generated';
import { getToken } from '../auth/tokenx';
import { logger } from '../utils/logger';

export async function getMineSykmeldte(accessToken: string): Promise<Sykmeldt[]> {
    const tokenX = await getTokenX(accessToken);
    return fetchMineSykmeldte(tokenX ?? 'token');
}

function fetchMineSykmeldte(token: string): Sykmeldt[] {
    logger.info('getting mine sykmeldte');
    if (token == null) {
        logger.info('Token is null');
    }
    return [];
}

async function getTokenX(accessToken: string): Promise<string | undefined> {
    return await getToken(accessToken, 'dev-gcp:teamsykmelding:dinesykmeldte-backend');
}
