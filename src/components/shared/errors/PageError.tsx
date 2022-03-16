import React from 'react';
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react';

import { getPublicEnv } from '../../../utils/env';

import PageErrorDad from './PageErrorDad';
import styles from './PageError.module.css';

const publicEnv = getPublicEnv();

interface Props {
    text?: string;
    noReload?: boolean;
}

const PageError = ({ text, noReload = false }: Props): JSX.Element => {
    return (
        <div className={styles.errorContainer}>
            <PageErrorDad className={styles.errorDad} />
            <div>
                <Heading spacing size="large" level="1">
                    Oops!
                </Heading>
                <Heading spacing size="small" level="2">
                    {text ?? 'Det har oppstått en uforventet feil'}
                </Heading>
                <BodyLong spacing>
                    {!noReload && (
                        <>
                            Du kan prøve å <Link href={publicEnv.publicPath}>laste siden på nytt</Link>.
                        </>
                    )}{' '}
                    Vi jobber allerede med å fikse feilen.
                </BodyLong>
                <BodyLong spacing>
                    Dersom problemet vedvarer kan du kontakte oss på arbeidsgivertelefonen: 55 55 33 36.
                </BodyLong>
                <Button className={styles.arbeidsgiversidenButton} as="a" href="https://www.nav.no/no/bedrift">
                    Tilbake til arbeidsgiversiden
                </Button>
            </div>
        </div>
    );
};

export default PageError;
