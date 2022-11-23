import React, { PropsWithChildren } from 'react'

import styles from './SporsmalListItem.module.css'

interface SporsmalListItemProps {
    listItemId?: string
}

function SporsmalListItem({ children, listItemId }: PropsWithChildren<SporsmalListItemProps>): JSX.Element {
    return (
        <li className={styles.blueListItem} aria-labelledby={listItemId ?? 'list-item'}>
            {children}
        </li>
    )
}

export default SporsmalListItem
