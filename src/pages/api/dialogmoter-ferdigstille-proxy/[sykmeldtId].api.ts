import { IncomingMessage } from 'http';

import { NextApiRequest, NextApiResponse } from 'next';

import metrics from '../../../metrics';
import { isLocalOrDemo } from '../../../utils/env';
import { createResolverContextType, withAuthenticatedApi } from '../../../auth/withAuthentication';
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

    metrics.redirectToDialogmoter.inc(1);
    if (queryParams == null) {
        logger.info(`No hendelseIds to resolve. Redirecting directly.`);
        res.redirect(getDialogmoterUrl(sykmeldtId));
        return;
    }

    logger.info(
        `Marking the following hendelseIds as resolved: ${
            typeof queryParams === 'string' ? queryParams : queryParams.join(', ')
        }`,
    );
    try {
        metrics.dialogmoterMarkedAsRead.inc(queryParams.length);
        const hendelseIds = typeof queryParams === 'string' ? [queryParams] : queryParams;
        await Promise.all(hendelseIds.map((hendelseId) => markHendelseResolved(hendelseId, req)));
    } catch (error: unknown) {
        metrics.dialogmoterMarkedAsReadFailed.inc(1);
        logger.error(error);
        res.redirect('/500');
        return;
    }

    res.redirect(getDialogmoterUrl(sykmeldtId));
};

function isValidQueryParams(hendelser: string | string[] | null): hendelser is string[] | string | null {
    return hendelser === null || typeof hendelser === 'string' || Array.isArray(hendelser);
}

function getDialogmoterUrl(narmestelederId: string): string {
    if (isLocalOrDemo) {
        return `https://dialogmotearbeidsgiver.labs.nais.io/syk/dialogmotearbeidsgiver/${narmestelederId}`;
    } else {
        return `/syk/dialogmotearbeidsgiver/${narmestelederId}`;
        // TODO bruk nye dialogmøter appen når eSYFO er klar
        // return `/syk/dialogmoter/arbeidsgiver/${narmestelederId}`;
    }
}

async function markHendelseResolved(hendelseId: string, request: IncomingMessage): Promise<void> {
    const client = createSsrApolloClient(request);
    const result = await client.mutate({ mutation: MarkHendelseResolvedDocument, variables: { hendelseId } });

    if (result.errors) {
        throw result.errors[0];
    }
}

export default withAuthenticatedApi(handler);
