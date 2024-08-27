import React, { ReactElement, useState } from 'react'
import { Button } from '@navikt/ds-react'

import { VeilederBorder } from './Veileder'

type Props = {
    storageKey: string
    title?: string
    text: string | string[]
    onOk?: () => void
}

function DismissableVeileder({ storageKey, title, text, onOk }: Props): ReactElement | null {
    const [hasDismissed, setDismissed] = useState<boolean>(JSON.parse(localStorage.getItem(storageKey) ?? 'false'))

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
