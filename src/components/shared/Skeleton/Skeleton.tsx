import React from 'react'

import styles from './Skeleton.module.css'

interface Props {
    width?: number
    error?: unknown
}

const Skeleton = ({ width, error }: Props): JSX.Element | null => {
    if (error) return null
    return <span className={styles.skeleton} style={{ width: width ?? '100%' }} />
}

export default Skeleton
