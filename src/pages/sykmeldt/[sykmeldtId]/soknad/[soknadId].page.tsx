import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import { useMarkSoknadReadMutation, useSoknadByIdQuery } from '../../../../graphql/queries/react-query.generated';
import { withAuthenticatedPage } from '../../../../auth/withAuthentication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../../graphql/prefetching';
import { createSoknadBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { logger } from '../../../../utils/logger';
import SideNavigation from '../../../../components/sidenavigation/SideNavigation';

function SoknadIdPage(): JSX.Element {
    const sykmeldtQuery = useSykmeldt();
    const { sykmeldtId, soknadId } = useParam(RouteLocation.Soknad);
    const { data, error, isLoading } = useSoknadByIdQuery({ soknadId });

    useMarkRead(soknadId);
    useUpdateBreadcrumbs(
        () => createSoknadBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    );

    return (
        <div>
            <Head>
                <title>Sykmelding - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldtQuery.sykmeldt}>
                <ContentContainer>
                    <div>{JSON.stringify({ data, isLoading, error: error?.message })}</div>
                </ContentContainer>
            </SideNavigation>
        </div>
    );
}

function useMarkRead(soknadId: string): void {
    const { mutateAsync } = useMarkSoknadReadMutation();

    useEffect(() => {
        (async () => {
            try {
                await mutateAsync({ soknadId: soknadId });
                logger.info(`Marked søknad ${soknadId} as read`);
            } catch (e) {
                logger.error(`Unable to mark søknad ${soknadId} as read`);
                throw e;
            }
        })();
    }, [mutateAsync, soknadId]);
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    const { soknadId } = context.query;
    if (typeof soknadId !== 'string') {
        throw new Error('Ugyldig soknadId id');
    }

    await prefetchQuery({ client, context }, useSoknadByIdQuery, { soknadId });

    return {
        props: wrapProps(client),
    };
});

export default SoknadIdPage;
