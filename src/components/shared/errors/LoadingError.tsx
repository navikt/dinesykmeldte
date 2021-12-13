import React from 'react';
import { Alert, BodyShort, Heading } from '@navikt/ds-react';

interface Props {
    errorMessage: string;
}

function LoadingError({ errorMessage }: Props): JSX.Element {
    return (
        <Alert variant="error">
            <Heading spacing size="small" level="2">
                Det har oppstått en feil
            </Heading>
            <BodyShort spacing>{errorMessage}</BodyShort>
            <BodyShort>Vi er på søken og prøver å løse problemet.</BodyShort>
        </Alert>
    );
}

export default LoadingError;
