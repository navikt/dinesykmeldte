import React, { useEffect } from 'react';
import Head from 'next/head';
import { ContentContainer } from '@navikt/ds-react';
import { setBreadcrumbs } from '@navikt/nav-dekoratoren-moduler';

import { Veileder } from '../../../../components/shared/veileder/Veileder';
import { logger } from '../../../../utils/logger';

function Sykmelding(): JSX.Element {
    useEffect(() => {
        setBreadcrumbs([
            { title: 'Dine sykmeldte', url: process.env.NEXT_PUBLIC_BASE_PATH || '/' },
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

export default Sykmelding;
