import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import Veileder from '../../../../components/shared/veileder/Veileder';
import { withAuthenticatedPage } from '../../../../auth/withAuthentication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../../graphql/prefetching';
import {
    SykmeldingFragment,
    useMarkSykmeldingReadMutation,
    useSykmeldingByIdQuery,
} from '../../../../graphql/queries/react-query.generated';
import { createSykmeldingBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { logger } from '../../../../utils/logger';

function Sykmelding(): JSX.Element {
    const sykmeldtQuery = useSykmeldt();
    const { sykmeldtId, sykmeldingId } = useParam(RouteLocation.Sykmelding);
    const { data, isLoading, error } = useSykmeldingByIdQuery({ sykmeldingId });

    useMarkRead(sykmeldingId, data?.sykmelding);
    useUpdateBreadcrumbs(
        () => createSykmeldingBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    );

    return (
        <div>
            <Head>
                <title>Sykmelding - nav.no</title>
            </Head>
            <ContentContainer>
                <Veileder
                    text={[
                        'Her skal du bare lese sykmeldingen, og sjekke om det er kommet noen anbefalinger fra den som har sykmeldt [NAVN].',
                        'Du trenger ikke sende sykmeldingen videre til noen. Når du har lest igjennom, er det bare å følge sykefraværsrutinene hos dere.',
                    ]}
                />
                <div>{JSON.stringify({ data, isLoading, error: error?.message })}</div>
            </ContentContainer>
        </div>
    );
}

function useMarkRead(sykmeldingId: string, sykmelding: SykmeldingFragment | undefined | null) {
    const { mutateAsync } = useMarkSykmeldingReadMutation();

    useEffect(() => {
        if (!sykmelding || sykmelding.lest) {
            return;
        }

        (async () => {
            try {
                await mutateAsync({ sykmeldingId: sykmeldingId });
                logger.info(`Marked sykmelding ${sykmeldingId} as read`);
            } catch (e) {
                logger.error(`Unable to mark sykmelding ${sykmeldingId} as read`);
            }
        })();
    }, [mutateAsync, sykmelding, sykmeldingId]);
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    const { sykmeldingId } = context.query;
    if (typeof sykmeldingId !== 'string') {
        throw new Error('Ugyldig sykmeldingId id');
    }

    await prefetchQuery({ client, context }, useSykmeldingByIdQuery, { sykmeldingId });

    return {
        props: wrapProps(client),
    };
});

export default Sykmelding;
