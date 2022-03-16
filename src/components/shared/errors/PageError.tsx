import React, { ReactNode } from 'react';
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react';
import { Employer } from '@navikt/ds-icons';

import { getPublicEnv } from '../../../utils/env';

import PageErrorDad from './PageErrorDad';
import styles from './PageError.module.css';
import NotFoundMom from './NotFoundMom';

const publicEnv = getPublicEnv();

interface Props {
    graphic?: 'dad' | 'mom';
    text?: string;
    details?: ReactNode;
    action?: ReactNode | null;
    noReload?: boolean;
}

const PageError = ({ graphic = 'dad', text, details, action, noReload = false }: Props): JSX.Element => {
    return (
        <div className={styles.errorContainer}>
            {graphic === 'dad' ? (
                <PageErrorDad className={styles.errorImage} />
            ) : (
                <NotFoundMom className={styles.errorImage} />
            )}
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
                    {details ?? 'Vi jobber allerede med å fikse feilen.'}
                </BodyLong>
                <BodyLong spacing>
                    {action ?? 'Dersom problemet vedvarer kan du kontakte oss på arbeidsgivertelefonen: 55 55 33 36.'}
                </BodyLong>
                <Button
                    className={styles.arbeidsgiversidenButton}
                    as="a"
                    href="https://www.nav.no/no/bedrift"
                    variant="tertiary"
                >
                    <Employer />
                    Tilbake til arbeidsgiversiden
                </Button>
            </div>
        </div>
    );
};

export default PageError;
