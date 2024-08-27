import React, { ReactElement, useEffect } from 'react'
import Head from 'next/head'
import { PersonIcon } from '@navikt/aksel-icons'
import { useMutation, useQuery } from '@apollo/client'
import { logger } from '@navikt/next-logger'
import { ChildPages, PageContainer } from '@navikt/dinesykmeldte-sidemeny'
import { BodyLong, Heading } from '@navikt/ds-react'

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
import { fnrText, formatNameSubjective } from '../../../../utils/sykmeldtUtils'
import SykmeldingPanel from '../../../../components/sykmeldingpanel/SykmeldingPanel'
import PageFallbackLoader from '../../../../components/shared/pagefallbackloader/PageFallbackLoader'
import PageSideMenu from '../../../../components/PageSideMenu/PageSideMenu'
import PageError from '../../../../components/shared/errors/PageError'
import { isUtenlandsk, UtenlandskSykmelding } from '../../../../utils/utenlanskUtils'
import SykmeldingPanelUtenlandsk from '../../../../components/SykmeldingPanelUtenlandsk/SykmeldingPanelUtenlandsk'

function Sykmelding(): ReactElement {
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
                Icon: PersonIcon,
                title: `Sykmelding for ${sykmeldtName}`,
                subtitle: sykmeldtQuery.sykmeldt && fnrText(sykmeldtQuery.sykmeldt.fnr),
                subtitleSkeleton: !sykmeldtQuery.error,
            }}
            sykmeldt={sykmeldtQuery.sykmeldt}
            navigation={<PageSideMenu sykmeldt={sykmeldtQuery.sykmeldt} activePage={ChildPages.Sykmelding} />}
        >
            <Head>
                <title>Sykmelding - Dine Sykmeldte - nav.no</title>
            </Head>
            {!hasError && (
                <section className="max-w-2xl mb-10" aria-labelledby="mottatt-sykmelding">
                    <Heading id="mottatt-sykmelding" className="mb-1" level="2" size="xsmall">
                        Du har mottatt en sykmelding
                    </Heading>
                    <BodyLong size="small">
                        Under kan du lese sykmeldingen og sjekke om det er kommet noen anbefalinger fra behandleren. Når
                        du har lest igjennom, er det bare å følge sykefraværsrutinene hos dere.
                    </BodyLong>
                </section>
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
                await mutate({ variables: { sykmeldingId }, refetchQueries: [{ query: MineSykmeldteDocument }] })
                logger.info(`Client: Marked sykmelding ${sykmeldingId} as read`)
            } catch (e) {
                logger.error(`Unable to mark sykmelding ${sykmeldingId} as read`)
                throw e
            }
        })()
    }, [mutate, sykmelding, sykmeldingId])
}

export const getServerSideProps = withAuthenticatedPage()

export default Sykmelding
