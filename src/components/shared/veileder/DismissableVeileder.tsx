import React, { useState } from 'react'
import { Button } from '@navikt/ds-react'

import { useLogAmplitudeEvent } from '../../../amplitude/amplitude'

import { VeilederBorder } from './Veileder'

type Props = {
    storageKey: string
    title?: string
    text: string | string[]
    onOk?: () => void
}

function DismissableVeileder({ storageKey, title, text, onOk }: Props): JSX.Element | null {
    const [hasDismissed, setDismissed] = useState<boolean>(JSON.parse(localStorage.getItem(storageKey) ?? 'false'))

    useLogAmplitudeEvent(
        {
            eventName: 'guidepanel vist',
            data: { tekst: title ?? storageKey, komponent: 'DismissableVeileder' },
        },
        undefined,
        () => !hasDismissed,
    )

    if (hasDismissed) return null

    return (
        <VeilederBorder title={title} text={text}>
            <Button
                size="small"
                className="mt-4"
                variant="secondary"
                onClick={() => {
                    localStorage.setItem(storageKey, 'true')
                    setDismissed(true)
                    onOk?.()
                }}
            >
                OK
            </Button>
        </VeilederBorder>
    )
}

export default DismissableVeileder
