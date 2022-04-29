import React from 'react';
import { People } from '@navikt/ds-icons';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';

import { formatNameSubjective } from '../../../utils/sykmeldtUtils';
import SykmeldtPeriodStatus from '../../../components/shared/SykmeldtPeriodStatus/SykmeldtPeriodStatus';
import Skeleton from '../../../components/shared/Skeleton/Skeleton';
import SideNavigation from '../../../components/sidenavigation/SideNavigation';
import PageWrapper from '../../../components/pagewrapper/PageWrapper';
import { createMeldingerBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import { useSykmeldt } from '../../../hooks/useSykmeldt';
import { withAuthenticatedPage } from '../../../auth/withAuthentication';
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader';
import PageError from '../../../components/shared/errors/PageError';
import MeldingerList from '../../../components/meldinger/MeldingerList';
import useFocusRefetch from '../../../hooks/useFocusRefetch';

const MeldingerPage = (): JSX.Element => {
    const { isLoading, sykmeldtId, sykmeldt, error, refetch } = useSykmeldt();
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn);

    useFocusRefetch(refetch);
    useUpdateBreadcrumbs(() => createMeldingerBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldt?.navn, sykmeldtId]);

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: sykmeldtName,
                subtitle: sykmeldt ? <SykmeldtPeriodStatus sykmeldt={sykmeldt} /> : <Skeleton error={error} />,
            }}
        >
            <Head>
                <title>Meldinger for {sykmeldtName} - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldt}>
                <ContentContainer>
                    {isLoading && <PageFallbackLoader text="Laster meldinger" />}
                    {sykmeldt && <MeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
                    {error && <PageError text="Vi klarte ikke å laste meldingene" />}
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
};

export const getServerSideProps = withAuthenticatedPage();

export default MeldingerPage;
