import React from 'react'
import { People } from '@navikt/ds-icons'
import Head from 'next/head'
import { PageContainer, RootPages } from '@navikt/dinesykmeldte-sidemeny'

import { formatNameSubjective } from '../../../utils/sykmeldtUtils'
import Skeleton from '../../../components/shared/Skeleton/Skeleton'
import PageSideMenu from '../../../components/PageSideMenu/PageSideMenu'
import { createMeldingerBreadcrumbs, useUpdateBreadcrumbs } from '../../../hooks/useBreadcrumbs'
import { useSykmeldt } from '../../../hooks/useSykmeldt'
import { withAuthenticatedPage } from '../../../auth/withAuthentication'
import PageFallbackLoader from '../../../components/shared/pagefallbackloader/PageFallbackLoader'
import PageError from '../../../components/shared/errors/PageError'
import MeldingerList from '../../../components/meldinger/MeldingerList'
import useFocusRefetch from '../../../hooks/useFocusRefetch'
import { addSpaceAfterEverySixthCharacter } from '../../../utils/stringUtils'

const MeldingerPage = (): JSX.Element => {
    const { isLoading, sykmeldtId, sykmeldt, error, refetch } = useSykmeldt()
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn)

    useFocusRefetch(refetch)
    useUpdateBreadcrumbs(() => createMeldingerBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldt?.navn, sykmeldtId])

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
            navigation={<PageSideMenu sykmeldt={sykmeldt} activePage={RootPages.Meldinger} />}
        >
            <Head>
                <title>Meldinger | Dine Sykmeldte - nav.no</title>
            </Head>
            {isLoading && <PageFallbackLoader text="Laster meldinger" />}
            {sykmeldt && <MeldingerList sykmeldtId={sykmeldtId} sykmeldt={sykmeldt} />}
            {error && <PageError text="Vi klarte ikke å laste meldingene" cause={error.message} />}
        </PageContainer>
    )
}

export const getServerSideProps = withAuthenticatedPage()

export default MeldingerPage
