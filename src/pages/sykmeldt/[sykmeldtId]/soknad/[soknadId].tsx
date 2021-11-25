import React from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import { useSoknadByIdQuery } from '../../../../graphql/queries/react-query.generated';
import { withAuthenticatedPage } from '../../../../auth/withAuthantication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../../graphql/prefetching';
import { useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { formatNamePossessive } from '../../../../utils/sykmeldtUtils';

function SoknadId(): JSX.Element {
    const sykmeldtQuery = useSykmeldt();
    const { sykmeldtId, soknadId } = useParam(RouteLocation.Soknad);
    const { data, error, isLoading } = useSoknadByIdQuery({ soknadId });

    useUpdateBreadcrumbs(
        () => [
            {
                title: formatNamePossessive(sykmeldtQuery.sykmeldt, 'søknader'),
                url: `/sykmeldt/${sykmeldtId}/soknader`,
            },
            { title: 'Søknad' },
        ],
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    );

    return (
        <div>
            <Head>
                <title>Sykmelding - nav.no</title>
            </Head>
            <ContentContainer>
                <div>{JSON.stringify({ data, isLoading, error: error?.message })}</div>
            </ContentContainer>
        </div>
    );
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

export default SoknadId;
