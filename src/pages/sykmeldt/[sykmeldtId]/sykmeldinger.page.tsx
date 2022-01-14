import Head from 'next/head';
import { BodyLong, ContentContainer } from '@navikt/ds-react';
import React from 'react';
import { QueryClient } from 'react-query';
import { People } from '@navikt/ds-icons';

import { GetServerSidePropsPrefetchResult } from '../../../shared/types';
import { useSykmeldt } from '../../../hooks/useSykmeldt';
import SykmeldingerList from '../../../components/sykmeldinger/SykmeldingerList';
import { withAuthenticatedPage } from '../../../auth/withAuthentication';
import { prefetchQuery, wrapProps } from '../../../graphql/prefetching';
import { useMineSykmeldteQuery } from '../../../graphql/queries/react-query.generated';
import { createSykmeldingerBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import LoadingError from '../../../components/shared/errors/LoadingError';
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader';
import { formatNameSubjective } from '../../../utils/sykmeldtUtils';
import SideNavigation from '../../../components/sidenavigation/SideNavigation';
import PageWrapper from '../../../components/pagewrapper/PageWrapper';

function Sykmeldinger(): JSX.Element {
    const { sykmeldtId, sykmeldt, isLoading, error } = useSykmeldt();

    useUpdateBreadcrumbs(() => createSykmeldingerBreadcrumbs(sykmeldt), [sykmeldt]);

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: formatNameSubjective(sykmeldt?.navn),
                subtitle: 'TODO nåværende sykmeldingsstatus',
            }}
        >
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldt}>
                <ContentContainer>
                    <BodyLong>
                        Her finner du sykmeldinger som {formatNameSubjective(sykmeldt?.navn)} har sendt fra nav.no.
                        Etter at et sykefravær er slutt, vil du bare se sykmeldinger som ikke er eldre enn fire måneder.
                        Sykmeldingene kommer også i Altinn.
                    </BodyLong>
                    {isLoading && <PageFallbackLoader text="Laster sykmeldinger" />}
                    {sykmeldt && <SykmeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
                    {error && <LoadingError errorMessage="Vi klarte ikke å laste sykmeldingene." />}
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    await prefetchQuery({ client, context }, useMineSykmeldteQuery);

    return {
        props: wrapProps(client),
    };
});

export default Sykmeldinger;
