import React, { ReactNode } from 'react'
import Image from 'next/legacy/image'
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'
import { Employer } from '@navikt/ds-icons'

import { browserEnv } from '../../../utils/env'
import { useLogAmplitudeEvent } from '../../../amplitude/amplitude'

import pageErrorDad from './svgs/page-error-dad.svg'
import notFoundMom from './svgs/not-found-mom.svg'

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
        <div className="flex max-w-3xl max-[960px]:flex-col" role="status" aria-live="polite">
            {graphic === 'dad' ? (
                <Image
                    src={pageErrorDad}
                    alt=""
                    className="max-[960px]:max-h[240px] mr-8 flex-[1_1_50%] max-[960px]:mb-4"
                />
            ) : (
                <Image
                    src={notFoundMom}
                    alt=""
                    className="max-[960px]:max-h[240px] mr-8 flex-[1_1_50%] max-[960px]:mb-4"
                />
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
                            Du kan prøve å <Link href={browserEnv.publicPath}>laste siden på nytt</Link>.
                        </>
                    )}
                </BodyLong>
                {details ?? <BodyLong spacing>Vi jobber allerede med å fikse feilen.</BodyLong>}
                <BodyLong spacing>
                    {action ?? 'Dersom problemet vedvarer kan du kontakte oss på arbeidsgivertelefonen: 55 55 33 36.'}
                </BodyLong>
                <Button
                    className="mt-4"
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
