import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { useMutation, useQuery } from '@apollo/client';
import { People } from '@navikt/ds-icons';

import {
    MarkSoknadReadDocument,
    MineSykmeldteDocument,
    SoknadByIdDocument,
} from '../../../../graphql/queries/graphql.generated';
import { withAuthenticatedPage } from '../../../../auth/withAuthentication';
import { createSoknadBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { logger } from '../../../../utils/logger';
import SideNavigation from '../../../../components/sidenavigation/SideNavigation';
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils';
import PageWrapper from '../../../../components/pagewrapper/PageWrapper';
import Veileder from '../../../../components/shared/veileder/Veileder';
import PageFallbackLoader from '../../../../components/shared/pagefallbackloader/PageFallbackLoader';
import VeilederMale from '../../../../components/shared/veileder/VeilederMaleSvg';
import SoknadPanel from '../../../../components/soknadpanel/SoknadPanel';
import SykmeldingPanelShort from '../../../../components/sykmeldingpanelshort/SykmeldingPanelShort';
import Skeleton from '../../../../components/shared/Skeleton/Skeleton';
import PageError from '../../../../components/shared/errors/PageError';
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils';

function SoknadIdPage(): JSX.Element {
    const sykmeldtQuery = useSykmeldt();
    const { sykmeldtId, soknadId } = useParam(RouteLocation.Soknad);
    const { data, error, loading } = useQuery(SoknadByIdDocument, { variables: { soknadId } });
    const hasError = error || sykmeldtQuery.error;
    const sykmeldtName = formatNameSubjective(sykmeldtQuery.sykmeldt?.navn);

    useMarkRead(soknadId);
    useUpdateBreadcrumbs(
        () => createSoknadBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    );

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: sykmeldtName,
                subtitle: sykmeldtQuery.sykmeldt ? (
                    <>{`F??dselsnr: ${addSpaceAfterEverySixthCharacter(sykmeldtQuery.sykmeldt.fnr)}`}</>
                ) : (
                    <Skeleton error={sykmeldtQuery.error} />
                ),
            }}
        >
            <Head>
                <title>S??knad for {sykmeldtName} - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldtQuery.sykmeldt}>
                <ContentContainer>
                    {!hasError && (
                        <Veileder
                            border={false}
                            flexWrap
                            illustration={<VeilederMale />}
                            text={[
                                `Her skal du bare sjekke om du ser noen feil i utfyllingen. I tilfelle gir du ${data?.soknad?.navn}
                             beskjed om ?? sende s??knaden p?? nytt.`,
                                data?.soknad?.sendtTilNavDato == null
                                    ? `S??knaden har ogs?? g??tt til virksomhetens innboks i Altinn, men ikke til saksbehandling i NAV. 
                            Hvis du mener s??knaden skal saksbehandles, m?? du be den ansatte om ?? ettersende den til NAV.`
                                    : '',
                            ]}
                        />
                    )}
                    {loading && <PageFallbackLoader text="Laster s??knad" />}
                    {hasError && <PageError text="Klarte ikke ?? laste denne s??knaden" />}
                    {data?.soknad?.sykmeldingId && !hasError && (
                        <>
                            <SoknadPanel soknad={data.soknad} />
                            <SykmeldingPanelShort sykmeldingId={data.soknad.sykmeldingId} />
                        </>
                    )}
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
}

function useMarkRead(soknadId: string): void {
    const [mutate] = useMutation(MarkSoknadReadDocument);

    useEffect(() => {
        (async () => {
            try {
                await mutate({ variables: { soknadId }, refetchQueries: [{ query: MineSykmeldteDocument }] });
                logger.info(`Marked s??knad ${soknadId} as read`);
            } catch (e) {
                logger.error(`Unable to mark s??knad ${soknadId} as read`);
                throw e;
            }
        })();
    }, [mutate, soknadId]);
}

export const getServerSideProps = withAuthenticatedPage();

export default SoknadIdPage;
