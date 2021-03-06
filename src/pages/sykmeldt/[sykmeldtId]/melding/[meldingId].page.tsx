import { People } from '@navikt/ds-icons';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import React from 'react';

import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { createMeldingBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import PageWrapper from '../../../../components/pagewrapper/PageWrapper';
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils';
import Skeleton from '../../../../components/shared/Skeleton/Skeleton';
import SideNavigation from '../../../../components/sidenavigation/SideNavigation';
import Aktivitet from '../../../../components/meldinger/Aktitiet/Aktivitet';
import { withAuthenticatedPage } from '../../../../auth/withAuthentication';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils';

const MeldingPage = (): JSX.Element => {
    const { sykmeldt, error } = useSykmeldt();
    const { sykmeldtId, meldingId } = useParam(RouteLocation.Melding);
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn);

    useUpdateBreadcrumbs(() => createMeldingBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldtId, sykmeldt?.navn]);

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: sykmeldtName,
                subtitle: sykmeldt ? (
                    <>{`Fødselsnr: ${addSpaceAfterEverySixthCharacter(sykmeldt.fnr)}`}</>
                ) : (
                    <Skeleton error={error} />
                ),
            }}
        >
            <Head>
                <title>Melding for {sykmeldtName} - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldt}>
                <ContentContainer>
                    <Aktivitet sykmeldtId={sykmeldtId} aktivitetsvarselId={meldingId} />
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
};

export const getServerSideProps = withAuthenticatedPage();

export default MeldingPage;
