import React, { useEffect } from 'react';
import { ContentContainer } from '@navikt/ds-react';

import { registerClientMetric } from '../utils/clientMetric';
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs';
import PageError from '../components/shared/errors/PageError';

function NotFound(): JSX.Element | boolean {
    useUpdateBreadcrumbs(() => [{ title: 'Ukjent side' }]);

    useEffect(() => {
        registerClientMetric({ type: '404' });
    }, []);

    return (
        <ContentContainer>
            <PageError noReload text="Vi fant ikke denne siden" />
        </ContentContainer>
    );
}

export default NotFound;
