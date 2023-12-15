import { PersonIcon } from '@navikt/aksel-icons'
import Head from 'next/head'
import React, { ReactElement, useEffect } from 'react'
import { ChildPages, PageContainer } from '@navikt/dinesykmeldte-sidemeny'
import { useMutation } from '@apollo/client'
import { logger } from '@navikt/next-logger'

import { useSykmeldt } from '../../../../hooks/useSykmeldt'
import { createMeldingBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs'
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils'
import Aktivitet from '../../../../components/meldinger/Aktitiet/Aktivitet'
import { withAuthenticatedPage } from '../../../../auth/withAuthentication'
import useParam, { RouteLocation } from '../../../../hooks/useParam'
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils'
import PageSideMenu from '../../../../components/PageSideMenu/PageSideMenu'
import { MarkAktivitetvarselReadDocument, MineSykmeldteDocument } from '../../../../graphql/queries/graphql.generated'
import { logAmplitudeEvent } from '../../../../amplitude/amplitude'

const MeldingPage = (): ReactElement => {
    const { sykmeldt, error } = useSykmeldt()
    const { sykmeldtId, meldingId } = useParam(RouteLocation.Melding)
    const sykmeldtName = formatNameSubjective(sykmeldt?.navn)

    useMarkRead(meldingId)
    useUpdateBreadcrumbs(() => createMeldingBreadcrumbs(sykmeldtId, sykmeldt?.navn), [sykmeldtId, sykmeldt?.navn])

    return (
        <PageContainer
            header={{
                Icon: PersonIcon,
                title: `Aktivitetsvarsel for ${sykmeldtName}`,
                subtitle: sykmeldt && `Fødselsnr: ${addSpaceAfterEverySixthCharacter(sykmeldt.fnr)}`,
                subtitleSkeleton: !error,
            }}
            sykmeldt={sykmeldt}
            navigation={<PageSideMenu sykmeldt={sykmeldt} activePage={ChildPages.Melding} />}
        >
            <Head>
                <title>Melding - Dine Sykmeldte - nav.no</title>
            </Head>
            <Aktivitet sykmeldtId={sykmeldtId} />
        </PageContainer>
    )
}

function useMarkRead(aktivitetsvarselId: string): void {
    const [mutate] = useMutation(MarkAktivitetvarselReadDocument)

    useEffect(() => {
        ;(async () => {
            try {
                logAmplitudeEvent({
                    eventName: 'skjema startet',
                    data: { skjemanavn: 'marker aktivitetsvarsel som lest' },
                })
                await mutate({ variables: { aktivitetsvarselId }, refetchQueries: [{ query: MineSykmeldteDocument }] })
                logger.info(`Marked aktivitetsvarsel with id ${aktivitetsvarselId} as read`)
            } catch (e) {
                logAmplitudeEvent({
                    eventName: 'skjema innsending feilet',
                    data: { skjemanavn: 'marker aktivitetsvarsel som lest' },
                })
                logger.error(`Unable to mark aktivitetsvarsel with id ${aktivitetsvarselId} as read`)
                throw e
            }
        })()
    }, [mutate, aktivitetsvarselId])
}

export const getServerSideProps = withAuthenticatedPage()

export default MeldingPage
