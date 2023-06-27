import React, { useEffect } from 'react'
import Head from 'next/head'
import { People } from '@navikt/ds-icons'
import { useMutation, useQuery } from '@apollo/client'
import { logger } from '@navikt/next-logger'
import { ChildPages, PageContainer } from '@navikt/dinesykmeldte-sidemeny'

import { Veileder } from '../../../../components/shared/veileder/Veileder'
import { withAuthenticatedPage } from '../../../../auth/withAuthentication'
import {
    MarkSykmeldingReadDocument,
    MineSykmeldteDocument,
    SykmeldingByIdDocument,
    SykmeldingFragment,
} from '../../../../graphql/queries/graphql.generated'
import { createSykmeldingBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs'
import useParam, { RouteLocation } from '../../../../hooks/useParam'
import { useSykmeldt } from '../../../../hooks/useSykmeldt'
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils'
import SykmeldingPanel from '../../../../components/sykmeldingpanel/SykmeldingPanel'
import PageFallbackLoader from '../../../../components/shared/pagefallbackloader/PageFallbackLoader'
import PageSideMenu from '../../../../components/PageSideMenu/PageSideMenu'
import PageError from '../../../../components/shared/errors/PageError'
import VeilederFemale from '../../../../components/shared/veileder/VeilederFemaleSvg'
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils'
import { logAmplitudeEvent } from '../../../../amplitude/amplitude'
import { isUtenlandsk, UtenlandskSykmelding } from '../../../../utils/utenlanskUtils'
import SykmeldingPanelUtenlandsk from '../../../../components/SykmeldingPanelUtenlandsk/SykmeldingPanelUtenlandsk'

function Sykmelding(): JSX.Element {
    const sykmeldtQuery = useSykmeldt()
    const { sykmeldtId, sykmeldingId } = useParam(RouteLocation.Sykmelding)
    const sykmeldingQuery = useQuery(SykmeldingByIdDocument, { variables: { sykmeldingId }, returnPartialData: true })
    const hasError = sykmeldingQuery.error || sykmeldtQuery.error
    const sykmeldtName = formatNameSubjective(sykmeldtQuery.sykmeldt?.navn)

    useMarkRead(sykmeldingId, sykmeldingQuery.data?.sykmelding)
    useUpdateBreadcrumbs(
        () => createSykmeldingBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    )

    return (
        <PageContainer
            header={{
                Icon: People,
                title: sykmeldtName,
                subtitle:
                    sykmeldtQuery.sykmeldt &&
                    `Fødselsnr: ${addSpaceAfterEverySixthCharacter(sykmeldtQuery.sykmeldt.fnr)}`,
                subtitleSkeleton: !sykmeldtQuery.error,
            }}
            sykmeldt={sykmeldtQuery.sykmeldt}
            navigation={<PageSideMenu sykmeldt={sykmeldtQuery.sykmeldt} activePage={ChildPages.Sykmelding} />}
        >
            <Head>
                <title>Sykmelding | Dine Sykmeldte - nav.no</title>
            </Head>
            {!hasError && (
                <Veileder
                    illustration={<VeilederFemale />}
                    text={[
                        'Under kan du lese sykmeldingen og sjekke om det er kommet noen anbefalinger fra behandleren.',
                        'Når du har lest igjennom, er det bare å følge sykefraværsrutinene hos dere.',
                    ]}
                />
            )}
            {sykmeldingQuery.loading && !sykmeldingQuery.data && <PageFallbackLoader text="Laster sykmelding" />}
            {hasError && (
                <PageError
                    text="Vi klarte ikke å laste denne sykmeldingen"
                    cause={
                        sykmeldingQuery.error?.message ?? sykmeldtQuery.error?.message ?? 'Unknown (sykmelding page)'
                    }
                />
            )}
            {sykmeldingQuery.data?.sykmelding && !hasError ? (
                isUtenlandsk(sykmeldingQuery.data?.sykmelding) ? (
                    <SykmeldingPanelUtenlandsk sykmelding={sykmeldingQuery.data.sykmelding} />
                ) : (
                    <SykmeldingPanel sykmelding={sykmeldingQuery.data.sykmelding} />
                )
            ) : null}
        </PageContainer>
    )
}

function useMarkRead(
    sykmeldingId: string,
    sykmelding: SykmeldingFragment | UtenlandskSykmelding | undefined | null,
): void {
    const [mutate] = useMutation(MarkSykmeldingReadDocument)

    useEffect(() => {
        if (!sykmelding || sykmelding.lest) {
            return
        }

        ;(async () => {
            try {
                logAmplitudeEvent({ eventName: 'skjema startet', data: { skjemanavn: 'marker sykmelding som lest' } })
                await mutate({ variables: { sykmeldingId }, refetchQueries: [{ query: MineSykmeldteDocument }] })
                logger.info(`Marked sykmelding ${sykmeldingId} as read`)
            } catch (e) {
                logAmplitudeEvent({
                    eventName: 'skjema innsending feilet',
                    data: { skjemanavn: 'marker sykmelding som lest' },
                })
                logger.error(`Unable to mark sykmelding ${sykmeldingId} as read`)
                throw e
            }
        })()
    }, [mutate, sykmelding, sykmeldingId])
}

export const getServerSideProps = withAuthenticatedPage()

export default Sykmelding
