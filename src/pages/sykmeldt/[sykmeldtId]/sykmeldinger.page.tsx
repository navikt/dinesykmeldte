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
import SykmeldtPeriodStatus from '../../../components/shared/SykmeldtPeriodStatus/SykmeldtPeriodStatus';
import Skeleton from '../../../components/shared/Skeleton/Skeleton';
import PageError from '../../../components/shared/errors/PageError';
import useFocusRefetch from '../../../hooks/useFocusRefetch';

function Sykmeldinger(): JSX.Element {
    const { sykmeldtId, sykmeldt, isLoading, error, refetch } = useSykmeldt();
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn);

    useFocusRefetch(refetch);
    useUpdateBreadcrumbs(() => createSykmeldingerBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldt?.navn, sykmeldtId]);

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: sykmeldtName,
                subtitle: sykmeldt ? <SykmeldtPeriodStatus sykmeldt={sykmeldt} /> : <Skeleton error={error} />,
            }}
        >
            <Head>
                <title>Sykmeldinger for {sykmeldtName} - nav.no</title>
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
