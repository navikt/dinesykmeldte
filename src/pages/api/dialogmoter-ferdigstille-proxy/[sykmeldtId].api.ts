import { IncomingMessage } from 'http';

import { NextApiRequest, NextApiResponse } from 'next';

import { isDevOrDemo } from '../../../utils/env';
import { createResolverContextType } from '../../../auth/withAuthentication';
import { MarkHendelseResolvedDocument } from '../../../graphql/queries/graphql.generated';
import { logger } from '../../../utils/logger';
import { createSsrApolloClient } from '../../../graphql/prefetching';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const sykmeldtId = req.query.sykmeldtId;
    const queryParams = (req.query.hendelser ?? null) as null | string | string[];

    if (!isValidQueryParams(queryParams) || typeof sykmeldtId !== 'string') {
        logger.error(
            `Malformed path or query params: sykmeldtId: ${sykmeldtId}, query: ${JSON.stringify(queryParams)}`,
        );
        res.redirect('/500');
        return;
    }

    const resolverContextType = createResolverContextType(req);
    if (!resolverContextType) {
        throw new Error('Illegal state: User not logged in during hendelse proxy.');
    }

    if (queryParams == null) {
        logger.info(`No hendelsesIds to resolve. Redirecting directly.`);
        res.redirect(getDialogmoterUrl(sykmeldtId));
        return;
    }

    logger.info(`Marking the following hendelsesIds as resolved: ${queryParams.join(', ')}`);

    try {
        await Promise.all(queryParams.map((hendelsesId) => markHendelseResolved(hendelsesId, req)));
    } catch (error: unknown) {
        logger.error(error);
        res.redirect('/500');
        return;
    }

    res.redirect(getDialogmoterUrl(sykmeldtId));
};

function isValidQueryParams(hendelser: string | string[] | null): hendelser is string[] | null {
    return hendelser === null || Array.isArray(hendelser);
}

function getDialogmoterUrl(narmestelederId: string): string {
    if (isDevOrDemo) {
        return `https://dialogmotearbeidsgiver.labs.nais.io/syk/dialogmotearbeidsgiver/${narmestelederId}`;
    } else {
        return `/syk/dialogmoter/arbeidsgiver/${narmestelederId}`;
    }
}

async function markHendelseResolved(hendelseId: string, request: IncomingMessage): Promise<void> {
    const client = createSsrApolloClient(request);
    const result = await client.mutate({ mutation: MarkHendelseResolvedDocument, variables: { hendelseId } });

    if (result.errors) {
        throw result.errors[0];
    }
}

export default handler;
