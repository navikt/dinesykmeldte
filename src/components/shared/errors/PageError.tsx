import React, { ReactElement, ReactNode } from 'react'
import Image from 'next/image'
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'
import { PersonSuitIcon } from '@navikt/aksel-icons'

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

const PageError = ({ graphic = 'dad', text, cause, details, action, noReload = false }: Props): ReactElement => {
    const errorText = text ?? 'Det har oppstått en uforventet feil'

    useLogAmplitudeEvent(
        {
            eventName: 'guidepanel vist',
            data: { tekst: errorText, komponent: 'PageError' },
        },
        { cause },
    )

    return (
        <div className="flex max-w-3xl gap-4 max-[960px]:flex-col mb-16" role="status" aria-live="polite">
            <div className="relative h-64 w-96 grow self-center">
                {graphic === 'dad' ? <Image src={pageErrorDad} alt="" fill /> : <Image src={notFoundMom} alt="" fill />}
            </div>
            <div>
                <Heading spacing size="medium" level="2">
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
                <BodyLong spacing className="mt-4 font-bold">
                    {action ?? 'Dersom problemet vedvarer kan du kontakte oss på arbeidsgivertelefonen: 55 55 33 36.'}
                </BodyLong>
                <Button
                    className="mt-4"
                    as="a"
                    href="https://www.nav.no/no/bedrift"
                    variant="tertiary"
                    icon={<PersonSuitIcon role="img" aria-hidden />}
                >
                    Tilbake til arbeidsgiversiden
                </Button>
            </div>
        </div>
    )
}

export default PageError
