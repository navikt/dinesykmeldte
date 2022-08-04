import { People } from '@navikt/ds-icons';
import Head from 'next/head';
import React from 'react';
import { ChildPages, PageContainer } from '@navikt/dinesykmeldte-sidemeny';

import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { createMeldingBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils';
import Skeleton from '../../../../components/shared/Skeleton/Skeleton';
import Aktivitet from '../../../../components/meldinger/Aktitiet/Aktivitet';
import { withAuthenticatedPage } from '../../../../auth/withAuthentication';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils';
import PageSideMenu from '../../../../components/PageSideMenu/PageSideMenu';

const MeldingPage = (): JSX.Element => {
    const { sykmeldt, error } = useSykmeldt();
    const { sykmeldtId, meldingId } = useParam(RouteLocation.Melding);
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn);

    useUpdateBreadcrumbs(() => createMeldingBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldtId, sykmeldt?.navn]);

    return (
        <PageContainer
            header={{
                Icon: People,
                title: sykmeldtName,
                subtitle: sykmeldt ? (
                    `Fødselsnr: ${addSpaceAfterEverySixthCharacter(sykmeldt.fnr)}`
                ) : (
                    <Skeleton error={error} />
                ),
            }}
            sykmeldt={sykmeldt}
            navigation={<PageSideMenu sykmeldt={sykmeldt} activePage={ChildPages.Melding} />}
        >
            <Head>
                <title>Melding | Dine Sykmeldte - nav.no</title>
            </Head>
            <Aktivitet sykmeldtId={sykmeldtId} aktivitetsvarselId={meldingId} />
        </PageContainer>
    );
};

export const getServerSideProps = withAuthenticatedPage();

export default MeldingPage;
