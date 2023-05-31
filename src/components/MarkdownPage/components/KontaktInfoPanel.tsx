import React, { PropsWithChildren } from 'react'
import { Heading } from '@navikt/ds-react'
import { Telephone } from '@navikt/ds-icons'
import { Clock } from '@navikt/ds-icons'

function KontaktInfoPanel({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
        <div className="mb-8 bg-blue-50 px-8 pb-2.5 pt-8">
            {children}
            <Heading className="mb-6" size="small" level="3">
                Har du spørsmål som du ikke finner svar på her inne?
            </Heading>
            <div className="mx-0 my-4 flex items-center">
                <Telephone role="img" aria-hidden />
                <p className="ml-2 font-semibold">Arbeidsgivertelefonen: 55 55 33 36</p>
            </div>
            <div className="mx-0 my-4 flex items-center">
                <Clock role="img" aria-hidden />
                <p className="ml-2 font-semibold">Åpen 8.00 - 15.30 mandag - fredag</p>
            </div>
        </div>
    )
}

export default KontaktInfoPanel
