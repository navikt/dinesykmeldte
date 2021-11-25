import Head from 'next/head';
import { BodyLong, ContentContainer, Loader } from '@navikt/ds-react';
import React from 'react';
import { QueryClient } from 'react-query';

import { GetServerSidePropsPrefetchResult } from '../../../shared/types';
import { useSykmeldt } from '../../../hooks/useSykmeldt';
import SykmeldingerList from '../../../components/sykmeldinger/SykmeldingerList';
import { withAuthenticatedPage } from '../../../auth/withAuthantication';
import { prefetchQuery, wrapProps } from '../../../graphql/prefetching';
import { useMineSykmeldteQuery } from '../../../graphql/queries/react-query.generated';
import { useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs';

function Sykmeldt(): JSX.Element {
    const { sykmeldtId, sykmeldt, isLoading, error } = useSykmeldt();

    useUpdateBreadcrumbs(() => [{ title: `${'TODO'}s sykmeldinger` }], []);

    return (
        <div>
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <ContentContainer>
                <BodyLong>
                    Her finner du sykmeldinger som TODO har sendt fra nav.no. Etter at et sykefravær er slutt, vil du
                    bare se sykmeldinger som ikke er eldre enn fire måneder. Sykmeldingene kommer også i Altinn.
                </BodyLong>
                {isLoading && <Loader aria-label="Laster dine ansatte" title="Laster dine ansatte" size="2xlarge" />}
                {sykmeldt && <SykmeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
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

export default Sykmeldt;
