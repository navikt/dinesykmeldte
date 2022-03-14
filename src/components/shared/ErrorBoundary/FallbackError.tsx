import React from 'react';
import { Alert, BodyLong, ContentContainer, Heading, Link } from '@navikt/ds-react';

import { getPublicEnv } from '../../../utils/env';

const publicEnv = getPublicEnv();

const FallbackError = (): JSX.Element => {
    return (
        <ContentContainer>
            <Alert variant="error">
                <Heading spacing size="small" level="2">
                    Det har oppstått en uforventet feil
                </Heading>
                <BodyLong spacing>
                    Du kan prøve å <Link href={publicEnv.publicPath}>laste siden på nytt</Link>. Vi jobber allerede med
                    å fikse feilen.
                </BodyLong>
                <BodyLong>
                    Dersom problemet vedvarer kan du kontakte oss på arbeidsgivertelefonen: 55 55 33 36.
                </BodyLong>
            </Alert>
        </ContentContainer>
    );
};

export default FallbackError;
