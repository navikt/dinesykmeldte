import React from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { Task } from '@navikt/ds-icons';

import { useSykmeldt } from '../../../hooks/useSykmeldt';
import SoknaderList from '../../../components/soknader/SoknaderList';
import { withAuthenticatedPage } from '../../../auth/withAuthentication';
import { formatNameSubjective } from '../../../utils/sykmeldtUtils';
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader';
import SideNavigation from '../../../components/sidenavigation/SideNavigation';
import { createSoknaderBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import PageWrapper from '../../../components/pagewrapper/PageWrapper';
import SoknaderInfo from '../../../components/SoknaderInfo/SoknaderInfo';
import { SykmeldtPeriodStatus } from '../../../components/shared/SykmeldtStatus/SykmeldtStatus';
import Skeleton from '../../../components/shared/Skeleton/Skeleton';
import PageError from '../../../components/shared/errors/PageError';

function Soknader(): JSX.Element {
    const { sykmeldtId, sykmeldt, isLoading, error } = useSykmeldt();

    useUpdateBreadcrumbs(() => createSoknaderBreadcrumbs(sykmeldt), [sykmeldt]);

    return (
        <PageWrapper
            title={{
                Icon: Task,
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
                    {isLoading && <PageFallbackLoader text="Laster søknader" />}
                    {sykmeldt && <SoknaderList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
                    {error && <PageError text="Vi klarte ikke å laste søknadene" />}
                    <SoknaderInfo />
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
}

export const getServerSideProps = withAuthenticatedPage();

export default Soknader;
