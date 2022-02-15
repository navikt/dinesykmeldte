import React, { useEffect } from 'react';
import { ContentContainer } from '@navikt/ds-react';

import { registerClientMetric } from '../utils/clientMetric';
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs';

function NotFound(): JSX.Element | boolean {
    useUpdateBreadcrumbs(() => [{ title: 'Ukjent side' }]);

    useEffect(() => {
        registerClientMetric({ type: '404' });
    }, []);

    return (
        <ContentContainer>
            <div>Fant ikke siden</div>
        </ContentContainer>
    );
}

export default NotFound;
