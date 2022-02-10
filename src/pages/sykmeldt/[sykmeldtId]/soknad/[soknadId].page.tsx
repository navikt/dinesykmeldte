import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';
import { Task } from '@navikt/ds-icons';

import { useMarkSoknadReadMutation, useSoknadByIdQuery } from '../../../../graphql/queries/react-query.generated';
import { withAuthenticatedPage } from '../../../../auth/withAuthentication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../../graphql/prefetching';
import { createSoknadBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { logger } from '../../../../utils/logger';
import SideNavigation from '../../../../components/sidenavigation/SideNavigation';
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils';
import PageWrapper from '../../../../components/pagewrapper/PageWrapper';
import Veileder from '../../../../components/shared/veileder/Veileder';
import PageFallbackLoader from '../../../../components/shared/pagefallbackloader/PageFallbackLoader';
import LoadingError from '../../../../components/shared/errors/LoadingError';
import VeilederMale from '../../../../components/shared/veileder/VeilederMaleSvg';
import SoknadPanel from '../../../../components/soknadpanel/SoknadPanel';
import SykmeldingPanelShort from '../../../../components/sykmeldingpanelshort/SykmeldingPanelShort';

function SoknadIdPage(): JSX.Element {
    const sykmeldtQuery = useSykmeldt();
    const { sykmeldtId, soknadId } = useParam(RouteLocation.Soknad);
    const { data, error, isLoading } = useSoknadByIdQuery({ soknadId });

    useMarkRead(soknadId);
    useUpdateBreadcrumbs(
        () => createSoknadBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    );

    return (
        <PageWrapper
            title={{
                Icon: Task,
                title: formatNameSubjective(sykmeldtQuery.sykmeldt?.navn),
                subtitle: 'TODO nåværende sykmeldingsstatus',
            }}
        >
            <Head>
                <title>Sykmelding - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldtQuery.sykmeldt}>
                <ContentContainer>
                    <Veileder
                        border={false}
                        illustration={<VeilederMale />}
                        text={[
                            `Her skal du bare sjekke om du ser noen feil i utfyllingen. I tilfelle gir du ${data?.soknad?.navn}
                             beskjed om å sende søknaden på nytt.`,
                            `Søknaden har også gått til virksomhetens innboks i Altinn, men ikke til saksbehandling i NAV. 
                            Hvis du mener søknaden skal saksbehandles, må du be den ansatte om å ettersende den til NAV.`,
                        ]}
                    />
                    {isLoading && <PageFallbackLoader text="Laster søknad" />}
                    {error && <LoadingError errorMessage="Vi klarte ikke å laste denne søknaden" />}
                    {data?.soknad?.sykmeldingId && (
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
    const { mutateAsync } = useMarkSoknadReadMutation();

    useEffect(() => {
        (async () => {
            try {
                await mutateAsync({ soknadId: soknadId });
                logger.info(`Marked søknad ${soknadId} as read`);
            } catch (e) {
                logger.error(`Unable to mark søknad ${soknadId} as read`);
                throw e;
            }
        })();
    }, [mutateAsync, soknadId]);
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    const { soknadId } = context.query;
    if (typeof soknadId !== 'string') {
        throw new Error('Ugyldig soknadId id');
    }

    await prefetchQuery({ client, context }, useSoknadByIdQuery, { soknadId });

    return {
        props: wrapProps(client),
    };
});

export default SoknadIdPage;
