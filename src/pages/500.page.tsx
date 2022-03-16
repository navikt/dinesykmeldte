import React, { useEffect } from 'react';
import { ContentContainer } from '@navikt/ds-react';

import { registerClientMetric } from '../utils/clientMetric';
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs';
import PageError from '../components/shared/errors/PageError';

function Error(): JSX.Element | boolean {
    useUpdateBreadcrumbs(() => [{ title: 'Ukjent feil' }]);

    useEffect(() => {
        registerClientMetric({ type: '500' });
    }, []);

    return (
        <ContentContainer>
            <PageError noReload />
        </ContentContainer>
    );
}

export default Error;
