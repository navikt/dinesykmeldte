import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { setBreadcrumbs } from '@navikt/nav-dekoratoren-moduler';
import { QueryClient } from 'react-query';
import { useRouter } from 'next/router';

import Veileder from '../../../../components/shared/veileder/Veileder';
import { logger } from '../../../../utils/logger';
import { withAuthenticatedPage } from '../../../../auth/withAuthantication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../../graphql/prefetching';
import { getPublicEnv } from '../../../../utils/env';
import { useSykmeldingByIdQuery } from '../../../../graphql/queries/react-query.generated';

const publicConfig = getPublicEnv();

function Sykmelding(): JSX.Element {
    const {
        query: { sykmeldingId },
    } = useRouter();

    useEffect(() => {
        setBreadcrumbs([
            // TODO fix this, ref: https://trello.com/c/xT1NWidw/1908-implementere-korrekte-breadcrumbs-p%C3%A5-alle-pages-i-dine-sykmeldte
            { title: 'Dine sykmeldte', url: publicConfig.publicPath || '/' },
            { title: 'This person', url: '/TODO/actual/path' },
            { title: 'Sykmelding', url: location.pathname },
        ]).catch(() => {
            logger.error('klarte ikke å oppdatere breadcrumbs');
        });
    });

    if (typeof sykmeldingId !== 'string') {
        throw new Error('Ugyldig sykmelding id');
    }

    const { data, isLoading, error } = useSykmeldingByIdQuery({ sykmeldingId });

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
