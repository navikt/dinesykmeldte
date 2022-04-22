import { IncomingMessage } from 'http';

import { NextApiRequest, NextApiResponse } from 'next';

import metrics from '../../../../metrics';
import { isLocalOrDemo } from '../../../../utils/env';
import { createResolverContextType, withAuthenticatedApi } from '../../../../auth/withAuthentication';
import { MarkHendelseResolvedDocument } from '../../../../graphql/queries/graphql.generated';
import { logger } from '../../../../utils/logger';
import { createSsrApolloClient } from '../../../../graphql/prefetching';

function logAndRedirect500(message: string, res: NextApiResponse): void {
    logger.error(message);
    res.redirect('/500');
}

type HendelsesType = 'dialogmote' | 'oppfolgingsplan';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const { sykmeldtId, type } = req.query;
    const queryParams = (req.query.hendelser ?? null) as null | string | string[];

    if (!isValidQueryParams(queryParams)) {
        logAndRedirect500(`Malformed query params: ${JSON.stringify(queryParams)}`, res);
        return;
    }

    if (!(type === 'dialogmote' || type === 'oppfolgingsplan')) {
        logAndRedirect500(`Invalid type: ${type}`, res);
        return;
    }

    if (typeof sykmeldtId !== 'string') {
        logAndRedirect500(`Malformed sykmeldtId: ${sykmeldtId}, typeof: ${typeof sykmeldtId}`, res);
        return;
    }

    const resolverContextType = createResolverContextType(req);
    if (!resolverContextType) {
        throw new Error('Illegal state: User not logged in during hendelse proxy.');
    }

    metrics.redirectToDialogmoter.inc(1);
    if (queryParams == null) {
        logger.info(`No hendelseIds to resolve. Redirecting directly.`);
        res.redirect(getRedirectUrl(sykmeldtId, type));
        return;
    }

    logger.info(
        `Marking the following hendelseIds as resolved: ${
            typeof queryParams === 'string' ? queryParams : queryParams.join(', ')
        }`,
    );
    try {
        type === 'dialogmote'
            ? metrics.dialogmoterMarkedAsRead.inc(queryParams.length)
            : metrics.oppfolgingsplanerMarkedAsRead.inc(queryParams.length);

        const hendelseIds = typeof queryParams === 'string' ? [queryParams] : queryParams;
        await Promise.all(hendelseIds.map((hendelseId) => markHendelseResolved(hendelseId, req)));
    } catch (error: unknown) {
        type === 'dialogmote'
            ? metrics.dialogmoterMarkedAsReadFailed.inc(1)
            : metrics.oppfolgingsplanerMarkedAsReadFailed.inc(1);
        logger.error(error);
        res.redirect('/500');
        return;
    }

    res.redirect(getRedirectUrl(sykmeldtId, type));
};

function getRedirectUrl(sykmeldtId: string, type: HendelsesType): string {
    if (type === 'dialogmote') {
        return getDialogmoterUrl(sykmeldtId);
    } else if (type === 'oppfolgingsplan') {
        return getOppfolgingsplanUrl(sykmeldtId);
    }

    throw new Error(`${type} is not a valid hendelse`);
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

function isValidQueryParams(hendelser: string | string[] | null): hendelser is string[] | string | null {
    return hendelser === null || typeof hendelser === 'string' || Array.isArray(hendelser);
}

export function getOppfolgingsplanUrl(narmestelederId: string): string {
    if (isLocalOrDemo) {
        return `https://oppfolgingsplanarbeidsgiver.labs.nais.io/syk/oppfolgingsplanarbeidsgiver/${narmestelederId}/oppfolgingsplaner`;
    }

    return `/syk/oppfolgingsplanarbeidsgiver/${narmestelederId}/oppfolgingsplaner`;
}

async function markHendelseResolved(hendelseId: string, request: IncomingMessage): Promise<void> {
    const client = createSsrApolloClient(request);
    const result = await client.mutate({ mutation: MarkHendelseResolvedDocument, variables: { hendelseId } });

    if (result.errors) {
        throw result.errors[0];
    }
}

export default withAuthenticatedApi(handler);
