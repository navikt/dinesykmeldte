import React, { ReactNode } from 'react'
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'
import { Employer } from '@navikt/ds-icons'

import { getPublicEnv } from '../../../utils/env'
import { useLogAmplitudeEvent } from '../../../amplitude/amplitude'

import PageErrorDad from './PageErrorDad'
import styles from './PageError.module.css'
import NotFoundMom from './NotFoundMom'

const publicEnv = getPublicEnv()

interface Props {
    graphic?: 'dad' | 'mom'
    text?: string
    cause: string
    details?: ReactNode
    action?: ReactNode | null
    noReload?: boolean
}

const PageError = ({ graphic = 'dad', text, cause, details, action, noReload = false }: Props): JSX.Element => {
    const errorText = text ?? 'Det har oppstått en uforventet feil'

    useLogAmplitudeEvent(
        {
            eventName: 'guidepanel vist',
            data: { tekst: errorText, komponent: 'PageError' },
        },
        { cause },
    )

    return (
        <div className={styles.errorContainer} role="status" aria-live="polite">
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
                    {errorText}
                </Heading>
                <BodyLong spacing={!details}>
                    {!noReload && (
                        <>
                            Du kan prøve å <Link href={publicEnv.publicPath}>laste siden på nytt</Link>.
                        </>
                    )}
                </BodyLong>
                {details ?? <BodyLong spacing>Vi jobber allerede med å fikse feilen.</BodyLong>}
                <BodyLong spacing>
                    {action ?? 'Dersom problemet vedvarer kan du kontakte oss på arbeidsgivertelefonen: 55 55 33 36.'}
                </BodyLong>
                <Button
                    className={styles.arbeidsgiversidenButton}
                    as="a"
                    href="https://www.nav.no/no/bedrift"
                    variant="tertiary"
                    icon={<Employer role="img" aria-hidden />}
                >
                    Tilbake til arbeidsgiversiden
                </Button>
            </div>
        </div>
    )
}

export default PageError
