import React from 'react';
import { ContentContainer } from '@navikt/ds-react';

function NotFound(): JSX.Element | boolean {
    return (
        <ContentContainer>
            <div>Fant ikke siden</div>
        </ContentContainer>
    );
}

export default NotFound;
