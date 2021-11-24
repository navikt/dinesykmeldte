import React from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import Veileder from '../../../../components/shared/veileder/Veileder';
import { withAuthenticatedPage } from '../../../../auth/withAuthantication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../../graphql/prefetching';
import { useSykmeldingByIdQuery } from '../../../../graphql/queries/react-query.generated';
import { useUpdateBreadcrumbs } from '../../../../utils/breadcrumb';
import useParam, { RouteLocation } from '../../../../hooks/useParam';

function Sykmelding(): JSX.Element {
    const { sykmeldtId, sykmeldingId } = useParam(RouteLocation.Sykmelding);
    const { data, isLoading, error } = useSykmeldingByIdQuery({ sykmeldingId });

    useUpdateBreadcrumbs(
        () => [
            { title: `${'TODO'}s sykmeldinger`, url: `/sykmeldt/${sykmeldtId}/sykmeldinger` },
            { title: 'Sykmelding', url: location.pathname },
        ],
        [sykmeldtId],
    );

    return (
        <div>
            <Head>
                <title>Sykmelding - nav.no</title>
            </Head>
            <ContentContainer>
                <Veileder
                    text={[
                        'Her skal du bare lese sykmeldingen, og sjekke om det er kommet noen anbefalinger fra den som har sykmeldt [NAVN].',
                        'Du trenger ikke sende sykmeldingen videre til noen. Når du har lest igjennom, er det bare å følge sykefraværsrutinene hos dere.',
                    ]}
                />
                <div>{JSON.stringify({ data, isLoading, error: error?.message })}</div>
            </ContentContainer>
        </div>
    );
}

export const getServerSideProps = withAuthenticatedPage(async (context): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    const { sykmeldingId } = context.query;
    if (typeof sykmeldingId !== 'string') {
        throw new Error('Ugyldig sykmeldingId id');
    }

    await prefetchQuery({ client, context }, useSykmeldingByIdQuery, { sykmeldingId });

    return {
        props: wrapProps(client),
    };
});

export default Sykmelding;
