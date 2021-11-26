import React from 'react';
import { ContentContainer } from '@navikt/ds-react';

function ServerError(): JSX.Element | boolean {
    return (
        <ContentContainer>
            <div>Det oppsto en uforventet feil</div>
        </ContentContainer>
    );
}

export default ServerError;
