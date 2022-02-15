import React, { useEffect } from 'react';
import { ContentContainer } from '@navikt/ds-react';

import { registerClientMetric } from '../utils/clientMetric';
import { useUpdateBreadcrumbs } from '../hooks/useBreadcrumbs';

function Error(): JSX.Element | boolean {
    useUpdateBreadcrumbs(() => [{ title: 'Ukjent feil' }]);

    useEffect(() => {
        registerClientMetric({ type: '500' });
    }, []);

    return (
        <ContentContainer>
            <div>Det oppsto en uforventet feil.</div>
        </ContentContainer>
    );
}

export default Error;
