import React from 'react';
import { ContentContainer } from '@navikt/ds-react';

function Error(): JSX.Element | boolean {
    return (
        <ContentContainer>
            <div>Det oppsto en uforventet feil.</div>
        </ContentContainer>
    );
}

export default Error;
