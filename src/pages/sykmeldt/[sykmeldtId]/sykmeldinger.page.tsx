import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import React from 'react';
import { People } from '@navikt/ds-icons';

import { useSykmeldt } from '../../../hooks/useSykmeldt';
import SykmeldingerList from '../../../components/sykmeldinger/SykmeldingerList';
import { withAuthenticatedPage } from '../../../auth/withAuthentication';
import { createSykmeldingerBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader';
import { formatNameSubjective } from '../../../utils/sykmeldtUtils';
import SideNavigation from '../../../components/sidenavigation/SideNavigation';
import PageWrapper from '../../../components/pagewrapper/PageWrapper';
import { SykmeldtPeriodStatus } from '../../../components/shared/SykmeldtStatus/SykmeldtStatus';
import Skeleton from '../../../components/shared/Skeleton/Skeleton';
import PageError from '../../../components/shared/errors/PageError';

function Sykmeldinger(): JSX.Element {
    const { sykmeldtId, sykmeldt, isLoading, error } = useSykmeldt();

    useUpdateBreadcrumbs(() => createSykmeldingerBreadcrumbs(sykmeldt), [sykmeldt]);

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: formatNameSubjective(sykmeldt?.navn),
                subtitle: sykmeldt ? (
                    <SykmeldtPeriodStatus sykmeldt={sykmeldt} includeName />
                ) : (
                    <Skeleton error={error} />
                ),
            }}
        >
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldt}>
                <ContentContainer>
                    {isLoading && <PageFallbackLoader text="Laster sykmeldinger" />}
                    {sykmeldt && <SykmeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
                    {error && <PageError text="Vi klarte ikke å laste sykmeldingene" />}
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
}

export const getServerSideProps = withAuthenticatedPage();

export default Sykmeldinger;
