import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { setBreadcrumbs } from '@navikt/nav-dekoratoren-moduler';
import { QueryClient } from 'react-query';

import Veileder from '../../../../components/shared/veileder/Veileder';
import { logger } from '../../../../utils/logger';
import { withAuthenticatedPage } from '../../../../auth/withAuthantication';
import { GetServerSidePropsPrefetchResult } from '../../../../shared/types';
import { wrapProps } from '../../../../graphql/queryPrefetcher';
import { getPublicEnv } from '../../../../utils/env';

const publicConfig = getPublicEnv();

function Sykmelding(): JSX.Element {
    useEffect(() => {
        setBreadcrumbs([
            { title: 'Dine sykmeldte', url: publicConfig.publicPath || '/' },
            { title: 'This person', url: '/TODO/actual/path' },
            { title: 'Sykmelding', url: location.pathname },
        ]).catch(() => {
            logger.error('klarte ikke å oppdatere breadcrumbs');
        });
    });

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
                <div>TODO sykmelding</div>
            </ContentContainer>
        </div>
    );
}

export const getServerSideProps = withAuthenticatedPage(async (): Promise<GetServerSidePropsPrefetchResult> => {
    const client = new QueryClient();

    return {
        props: wrapProps(client),
    };
});

export default Sykmelding;
