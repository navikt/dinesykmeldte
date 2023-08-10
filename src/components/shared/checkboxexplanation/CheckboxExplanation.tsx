import { BodyShort } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { cn } from '../../../utils/tw-utils'
import CheckboxIcon from '../icons/CheckboxIcon'

function CheckboxExplanation({ text, alignStart }: { text: string; alignStart?: boolean }): ReactElement {
    return (
        <div className={cn('m-2 flex items-end', { 'items-start': alignStart })}>
            <CheckboxIcon role="img" aria-hidden />
            <BodyShort className="ml-2" size="small">
                {text}
            </BodyShort>
        </div>
    )
}

export default CheckboxExplanation
