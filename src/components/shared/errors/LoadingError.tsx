import React from 'react';
import { Alert, BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';

interface Props {
    errorMessage: string;
}

function LoadingError({ errorMessage }: Props): JSX.Element {
    return (
        <Alert variant="error" role="alert" id={cleanId(errorMessage)}>
            <Heading spacing size="small" level="2">
                Det har oppstått en feil
            </Heading>
            <BodyShort spacing>{errorMessage}</BodyShort>
            <BodyShort>Vi er på søken og prøver å løse problemet.</BodyShort>
        </Alert>
    );
}

export default LoadingError;
