import React from 'react';
import Head from 'next/head';
import { BodyLong, ContentContainer, Loader } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import { useSykmeldt } from '../../../hooks/useSykmeldt';
import SoknaderList from '../../../components/soknader/SoknaderList';
import { withAuthenticatedPage } from '../../../auth/withAuthantication';
import { GetServerSidePropsPrefetchResult } from '../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../graphql/prefetching';
import { useMineSykmeldteQuery } from '../../../graphql/queries/react-query.generated';
import { createSoknaderBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs';

function Soknader(): JSX.Element {
    const { sykmeldtId, sykmeldt, isLoading, error } = useSykmeldt();

    useUpdateBreadcrumbs(() => createSoknaderBreadcrumbs(sykmeldt), [sykmeldt]);

    return (
        <div>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <BodyLong>
                    Her finner du søknader som TODO har sendt fra nav.no. Etter at et sykefravær er slutt, vil du bare
                    se sykmeldinger som ikke er eldre enn fire måneder. Sykmeldingene kommer også i Altinn.
                </BodyLong>
                {isLoading && <Loader aria-label="Laster dine ansatte" title="Laster dine ansatte" size="2xlarge" />}
                {sykmeldt && <SoknaderList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
                {error && <div>TODO: error {error.message}</div>}
            </ContentContainer>
        </div>
    );
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    await prefetchQuery({ client, context }, useMineSykmeldteQuery);

    return {
        props: wrapProps(client),
    };
});

export default Soknader;