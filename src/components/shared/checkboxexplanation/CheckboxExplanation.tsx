import { BodyShort } from '@navikt/ds-react'
import React from 'react'
import cn from 'classnames'

import CheckboxIcon from '../icons/CheckboxIcon'

import styles from './CheckboxExplanation.module.css'

function CheckboxExplanation({ text, alignStart }: { text: string; alignStart?: boolean }): JSX.Element {
    return (
        <div className={cn(styles.checkboxExplainationRoot, { [styles.alignStart]: alignStart })}>
            <CheckboxIcon role="img" aria-hidden />
            <BodyShort size="small">{text}</BodyShort>
        </div>
    )
}

export default CheckboxExplanation
