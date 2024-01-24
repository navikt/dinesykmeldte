import Head from 'next/head'
import React, { ReactElement } from 'react'
import { PersonIcon } from '@navikt/aksel-icons'
import { PageContainer, RootPages } from '@navikt/dinesykmeldte-sidemeny'

import { useSykmeldt } from '../../../hooks/useSykmeldt'
import SykmeldingerList from '../../../components/sykmeldinger/SykmeldingerList'
import { withAuthenticatedPage } from '../../../auth/withAuthentication'
import { createSykmeldingerBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs'
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader'
import { fnrText, formatNameSubjective } from '../../../utils/sykmeldtUtils'
import PageSideMenu from '../../../components/PageSideMenu/PageSideMenu'
import PageError from '../../../components/shared/errors/PageError'
import useFocusRefetch from '../../../hooks/useFocusRefetch'
import SykmeldtNotFound from '../../../components/shared/errors/SykmeldtNotFound'

function Sykmeldinger(): ReactElement {
    const { sykmeldtId, sykmeldt, isLoading, error, sykmeldtNotFound, refetch } = useSykmeldt()
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn)

    useFocusRefetch(refetch)
    useUpdateBreadcrumbs(() => createSykmeldingerBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldt?.navn, sykmeldtId])

    return (
        <PageContainer
            header={{
                Icon: PersonIcon,
                title: `Sykmeldinger for ${sykmeldtName}`,
                subtitle: sykmeldt && fnrText(sykmeldt.fnr),
                subtitleSkeleton: !error && !sykmeldtNotFound,
            }}
            sykmeldt={sykmeldt}
            navigation={!sykmeldtNotFound && <PageSideMenu activePage={RootPages.Sykmeldinger} sykmeldt={sykmeldt} />}
        >
            <Head>
                <title>Sykmeldinger - Dine Sykmeldte - nav.no</title>
            </Head>

            {isLoading && <PageFallbackLoader text="Laster sykmeldinger" />}
            {sykmeldt && <SykmeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
            {error && !sykmeldtNotFound && (
                <PageError text="Vi klarte ikke å laste sykmeldingene" cause={error.message} />
            )}
            {sykmeldtNotFound && !error && <SykmeldtNotFound />}
        </PageContainer>
    )
}

export const getServerSideProps = withAuthenticatedPage()

export default Sykmeldinger
