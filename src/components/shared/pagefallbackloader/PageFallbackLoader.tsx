import React from 'react'
import { Loader } from '@navikt/ds-react'

import styles from './PageFallbackLoader.module.css'

interface Props {
    text: string
}

const PageFallbackLoader = ({ text }: Props): JSX.Element => {
    return (
        <div className={styles.root}>
            <Loader aria-label={text} title={text} size="2xlarge" />
        </div>
    )
}

export default PageFallbackLoader
