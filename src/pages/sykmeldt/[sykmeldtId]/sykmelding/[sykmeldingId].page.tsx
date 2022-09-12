import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { People } from '@navikt/ds-icons';
import { useMutation, useQuery } from '@apollo/client';
import { logger } from '@navikt/next-logger';

import Veileder from '../../../../components/shared/veileder/Veileder';
import { withAuthenticatedPage } from '../../../../auth/withAuthentication';
import {
    MarkSykmeldingReadDocument,
    MineSykmeldteDocument,
    SykmeldingByIdDocument,
    SykmeldingFragment,
} from '../../../../graphql/queries/graphql.generated';
import { createSykmeldingBreadcrumbs, useUpdateBreadcrumbs } from '../../../../hooks/useBreadcrumbs';
import useParam, { RouteLocation } from '../../../../hooks/useParam';
import { useSykmeldt } from '../../../../hooks/useSykmeldt';
import { formatNameSubjective } from '../../../../utils/sykmeldtUtils';
import SykmeldingPanel from '../../../../components/sykmeldingpanel/SykmeldingPanel';
import PageFallbackLoader from '../../../../components/shared/pagefallbackloader/PageFallbackLoader';
import SideNavigation from '../../../../components/sidenavigation/SideNavigation';
import PageWrapper from '../../../../components/pagewrapper/PageWrapper';
import Skeleton from '../../../../components/shared/Skeleton/Skeleton';
import PageError from '../../../../components/shared/errors/PageError';
import VeilederFemale from '../../../../components/shared/veileder/VeilederFemaleSvg';
import { addSpaceAfterEverySixthCharacter } from '../../../../utils/stringUtils';

function Sykmelding(): JSX.Element {
    const sykmeldtQuery = useSykmeldt();
    const { sykmeldtId, sykmeldingId } = useParam(RouteLocation.Sykmelding);
    const sykmeldingQuery = useQuery(SykmeldingByIdDocument, { variables: { sykmeldingId }, returnPartialData: true });
    const hasError = sykmeldingQuery.error || sykmeldtQuery.error;
    const sykmeldtName = formatNameSubjective(sykmeldtQuery.sykmeldt?.navn);

    useMarkRead(sykmeldingId, sykmeldingQuery.data?.sykmelding);
    useUpdateBreadcrumbs(
        () => createSykmeldingBreadcrumbs(sykmeldtId, sykmeldtQuery.sykmeldt),
        [sykmeldtId, sykmeldtQuery.sykmeldt],
    );

    return (
        <PageWrapper
            title={{
                Icon: People,
                title: sykmeldtName,
                subtitle: sykmeldtQuery.sykmeldt ? (
                    <>{`Fødselsnr: ${addSpaceAfterEverySixthCharacter(sykmeldtQuery.sykmeldt.fnr)}`}</>
                ) : (
                    <Skeleton error={sykmeldtQuery.error} />
                ),
            }}
        >
            <Head>
                <title>Sykmelding | Dine Sykmeldte - nav.no</title>
            </Head>
            <SideNavigation sykmeldt={sykmeldtQuery.sykmeldt}>
                <ContentContainer>
                    {!hasError && (
                        <Veileder
                            border={false}
                            flexWrap
                            illustration={<VeilederFemale />}
                            text={[
                                'Under kan du lese sykmeldingen og sjekke om det er kommet noen anbefalinger fra behandleren.',
                                'Når du har lest igjennom, er det bare å følge sykefraværsrutinene hos dere.',
                            ]}
                        />
                    )}
                    {sykmeldingQuery.loading && !sykmeldingQuery.data && (
                        <PageFallbackLoader text="Laster sykmelding" />
                    )}
                    {hasError && <PageError text="Vi klarte ikke å laste denne sykmeldingen" />}
                    {sykmeldingQuery.data?.sykmelding && !hasError && (
                        <SykmeldingPanel sykmelding={sykmeldingQuery.data.sykmelding} />
                    )}
                </ContentContainer>
            </SideNavigation>
        </PageWrapper>
    );
}

function useMarkRead(sykmeldingId: string, sykmelding: SykmeldingFragment | undefined | null): void {
    const [mutate] = useMutation(MarkSykmeldingReadDocument);

    useEffect(() => {
        if (!sykmelding || sykmelding.lest) {
            return;
        }

        (async () => {
            try {
                await mutate({ variables: { sykmeldingId }, refetchQueries: [{ query: MineSykmeldteDocument }] });
                logger.info(`Marked sykmelding ${sykmeldingId} as read`);
            } catch (e) {
                logger.error(`Unable to mark sykmelding ${sykmeldingId} as read`);
                throw e;
            }
        })();
    }, [mutate, sykmelding, sykmeldingId]);
}

export const getServerSideProps = withAuthenticatedPage();

export default Sykmelding;
