import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { setBreadcrumbs } from '@navikt/nav-dekoratoren-moduler';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { QueryClient } from 'react-query';

import { useSoknadByIdQuery } from '../../../../graphql/queries/react-query.generated';
import { logger } from '../../../../utils/logger';
import { getPublicEnv } from '../../../../utils/env';
import { withAuthenticatedPage } from '../../../../auth/withAuthantication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { prefetchQuery, wrapProps } from '../../../../graphql/prefetching';

const publicConfig = getPublicEnv();

function SoknadId(): JSX.Element {
    const {
        query: { soknadId },
    } = useRouter();

    useEffect(() => {
        setBreadcrumbs([
            { title: 'Dine sykmeldte', url: publicConfig.publicPath || '/' },
            { title: 'This person', url: '/TODO/actual/path' },
            { title: 'Sykmelding', url: location.pathname },
        ]).catch(() => {
            logger.error('klarte ikke å oppdatere breadcrumbs');
        });
    });

    if (typeof soknadId !== 'string') {
        throw new Error('Ugyldig soknadId id');
    }

    const { data, error, isLoading } = useSoknadByIdQuery({ soknadId });

    return (
        <div>
            <Head>
                <title>Sykmelding - nav.no</title>
            </Head>
            <ContentContainer>
                <div>{JSON.stringify({ data, isLoading, error: error?.message })}</div>
            </ContentContainer>
        </div>
    );
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

export default SoknadId;
