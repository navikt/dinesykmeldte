import React, { ReactElement, useEffect } from 'react'
import Head from 'next/head'
import { useMutation, useQuery } from '@apollo/client'
import { PersonIcon } from '@navikt/aksel-icons'
import { ChildPages, PageContainer } from '@navikt/dinesykmeldte-sidemeny'
import { logger } from '@navikt/next-logger'
import { BodyLong, Heading } from '@navikt/ds-react'

import {
    MarkSoknadReadDocument,
    MineSykmeldteDocument,
    SoknadByIdDocument,
} from '../../../../graphql/queries/graphql.generated'
import { withAuthenticatedPage } from '../../../../auth/withAuthentication'
import { createSoknadBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs'
import useParam, { RouteLocation } from '../../../../hooks/useParam'
import { useSykmeldt } from '../../../../hooks/useSykmeldt'
import PageSideMenu from '../../../../components/PageSideMenu/PageSideMenu'
import { fnrText, formatNameSubjective } from '../../../../utils/sykmeldtUtils'
import PageFallbackLoader from '../../../../components/shared/pagefallbackloader/PageFallbackLoader'
import SoknadPanel from '../../../../components/soknadpanel/SoknadPanel'
import SykmeldingPanelShort from '../../../../components/sykmeldingpanelshort/SykmeldingPanelShort'
import PageError from '../../../../components/shared/errors/PageError'
import { logAmplitudeEvent } from '../../../../amplitude/amplitude'

function SoknadIdPage(): ReactElement {
    const sykmeldtQuery = useSykmeldt()
    const { sykmeldtId, soknadId } = useParam(RouteLocation.Soknad)
    const { data, error, loading } = useQuery(SoknadByIdDocument, { variables: { soknadId } })
    const hasError = error || sykmeldtQuery.error
    const sykmeldtName = formatNameSubjective(sykmeldtQuery.sykmeldt?.navn)

    useMarkRead(soknadId)
    useUpdateBreadcrumbs(
        () => createSoknadBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    )

    return (
        <PageContainer
            header={{
                Icon: PersonIcon,
                title: `Søknad for ${sykmeldtName}`,
                subtitle: sykmeldtQuery.sykmeldt && fnrText(sykmeldtQuery.sykmeldt.fnr),
                subtitleSkeleton: !sykmeldtQuery.error,
            }}
            sykmeldt={sykmeldtQuery.sykmeldt}
            navigation={<PageSideMenu sykmeldt={sykmeldtQuery.sykmeldt} activePage={ChildPages.Soknad} />}
        >
            <Head>
                <title>Søknad - Dine Sykmeldte - nav.no</title>
            </Head>
            {!hasError && (
                <section className="max-w-2xl mb-10" aria-labelledby="mottatt-søknad">
                    <Heading id="mottatt-søknad" className="mb-1" level="2" size="xsmall">
                        Du har mottatt en søknad om sykepenger
                    </Heading>
                    <BodyLong size="small">
                        Her skal du bare sjekke om du ser noen feil i utfyllingen. I tilfelle gir du{' '}
                        {formatNameSubjective(data?.soknad?.navn)} beskjed om å sende søknaden på nytt.
                    </BodyLong>
                    <BodyLong>
                        {!loading && data?.soknad?.sendtTilNavDato == null
                            ? `Søknaden har også gått til virksomhetens innboks i Altinn, men ikke til saksbehandling i NAV. 
                        Hvis du mener søknaden skal saksbehandles, må du be den ansatte om å ettersende den til NAV.`
                            : ''}
                    </BodyLong>
                </section>
            )}
            {loading && <PageFallbackLoader text="Laster søknad" />}
            {hasError && (
                <PageError
                    text="Klarte ikke å laste denne søknaden"
                    cause={error?.message ?? sykmeldtQuery.error?.message ?? 'Unknown (soknad page)'}
                />
            )}
            {data?.soknad?.sykmeldingId && !hasError && (
                <>
                    <SoknadPanel soknad={data.soknad} />
                    <SykmeldingPanelShort sykmeldingId={data.soknad.sykmeldingId} />
                </>
            )}
        </PageContainer>
    )
}

function useMarkRead(soknadId: string): void {
    const [mutate] = useMutation(MarkSoknadReadDocument)

    useEffect(() => {
        ;(async () => {
            try {
                /*
                 Amplitude for this event is handled in SoknadPanel so this mutation doesn't
                 require the søknad-object to be loaded to be able to deduce if it is korrigert or not
                */
                await mutate({ variables: { soknadId }, refetchQueries: [{ query: MineSykmeldteDocument }] })
                logger.info(`Marked søknad ${soknadId} as read`)
            } catch (e) {
                logAmplitudeEvent({
                    eventName: 'skjema innsending feilet',
                    data: { skjemanavn: 'marker sendt soknad som lest' },
                })
                logger.error(`Unable to mark søknad ${soknadId} as read`)
                throw e
            }
        })()
    }, [mutate, soknadId])
}

export const getServerSideProps = withAuthenticatedPage()

export default SoknadIdPage
