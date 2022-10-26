import React, { PropsWithChildren } from 'react'

import styles from './SporsmalListItemNested.module.css'

interface SporsmalListItemNestedProps {
    listItemId?: string
}

function SporsmalListItemNested({ children, listItemId }: PropsWithChildren<SporsmalListItemNestedProps>): JSX.Element {
    return (
        <li className={styles.nestedListItem} aria-labelledby={listItemId ?? 'list-item-nested'}>
            {children}
        </li>
    )
}

export default SporsmalListItemNested
