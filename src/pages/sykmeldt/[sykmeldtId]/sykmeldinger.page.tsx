import Head from 'next/head'
import React, { ReactElement } from 'react'
import { PersonIcon } from '@navikt/aksel-icons'
import { PageContainer, RootPages } from '@navikt/dinesykmeldte-sidemeny'

import { useSykmeldt } from '../../../hooks/useSykmeldt'
import SykmeldingerList from '../../../components/sykmeldinger/SykmeldingerList'
import { withAuthenticatedPage } from '../../../auth/withAuthentication'
import { createSykmeldingerBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs'
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader'
import { formatNameSubjective } from '../../../utils/sykmeldtUtils'
import PageSideMenu from '../../../components/PageSideMenu/PageSideMenu'
import PageError from '../../../components/shared/errors/PageError'
import useFocusRefetch from '../../../hooks/useFocusRefetch'
import { addSpaceAfterEverySixthCharacter } from '../../../utils/stringUtils'

function Sykmeldinger(): ReactElement {
    const { sykmeldtId, sykmeldt, isLoading, error, refetch } = useSykmeldt()
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn)

    useFocusRefetch(refetch)
    useUpdateBreadcrumbs(() => createSykmeldingerBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldt?.navn, sykmeldtId])

    return (
        <PageContainer
            header={{
                Icon: PersonIcon,
                title: sykmeldtName,
                subtitle: sykmeldt && `Fødselsnr: ${addSpaceAfterEverySixthCharacter(sykmeldt.fnr)}`,
                subtitleSkeleton: !error,
            }}
            sykmeldt={sykmeldt}
            navigation={<PageSideMenu activePage={RootPages.Sykmeldinger} sykmeldt={sykmeldt} />}
        >
            <Head>
                <title>Sykmeldinger | Dine Sykmeldte - nav.no</title>
            </Head>

            {isLoading && <PageFallbackLoader text="Laster sykmeldinger" />}
            {sykmeldt && <SykmeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
            {error && <PageError text="Vi klarte ikke å laste sykmeldingene" cause={error.message} />}
        </PageContainer>
    )
}

export const getServerSideProps = withAuthenticatedPage()

export default Sykmeldinger
