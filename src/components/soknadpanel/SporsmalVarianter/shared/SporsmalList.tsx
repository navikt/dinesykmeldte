import React, { PropsWithChildren } from 'react'

import styles from './SporsmalList.module.css'

function SporsmalList({ children }: PropsWithChildren<unknown>): JSX.Element {
    return <ul className={styles.listItemList}>{children}</ul>
}

export default SporsmalList
