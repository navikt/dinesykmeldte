import Head from 'next/head';
import { BodyLong, ContentContainer } from '@navikt/ds-react';
import React from 'react';
import { People } from '@navikt/ds-icons';

import { useSykmeldt } from '../../../hooks/useSykmeldt';
import SykmeldingerList from '../../../components/sykmeldinger/SykmeldingerList';
import { withAuthenticatedPage } from '../../../auth/withAuthentication';
import { createSykmeldingerBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs';
import LoadingError from '../../../components/shared/errors/LoadingError';
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader';
import { formatNameSubjective } from '../../../utils/sykmeldtUtils';
import SideNavigation from '../../../components/sidenavigation/SideNavigation';
import PageWrapper from '../../../components/pagewrapper/PageWrapper';
import { SykmeldtPeriodStatus } from '../../../components/shared/SykmeldtStatus/SykmeldtStatus';
import Skeleton from '../../../components/shared/Skeleton/Skeleton';

function Sykmeldinger(): JSX.Element {
    const { sykmeldtId, sykmeldt, isLoading, error } = useSykmeldt();

    useUpdateBreadcrumbs(() => createSykmeldingerBreadcrumbs(sykmeldt), [sykmeldt]);

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: formatNameSubjective(sykmeldt?.navn),
                subtitle: sykmeldt ? <SykmeldtPeriodStatus sykmeldt={sykmeldt} /> : <Skeleton />,
            }}
        >
            <Head>
                <title>Dine sykmeldte - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldt}>
                <ContentContainer>
                    <BodyLong>
                        Her finner du sykmeldinger fra {formatNameSubjective(sykmeldt?.navn)}, men bare de som er yngre
                        enn fire måneder. På Altinn finner du alle sykmeldinger.
                    </BodyLong>
                    {isLoading && <PageFallbackLoader text="Laster sykmeldinger" />}
                    {sykmeldt && <SykmeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
                    {error && <LoadingError errorMessage="Vi klarte ikke å laste sykmeldingene." />}
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
}

export const getServerSideProps = withAuthenticatedPage();

export default Sykmeldinger;
