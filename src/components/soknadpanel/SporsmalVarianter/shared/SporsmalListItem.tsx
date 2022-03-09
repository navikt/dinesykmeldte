import React, { PropsWithChildren } from 'react';
import cn from 'classnames';

import styles from './SporsmalListItem.module.css';

interface SporsmalListItemProps {
    listItemId?: string;
    noBorderAndSpacing?: boolean;
}

function SporsmalListItem({
    children,
    listItemId,
    noBorderAndSpacing,
}: PropsWithChildren<SporsmalListItemProps>): JSX.Element {
    return (
        <li
            className={cn(styles.listItem, { [styles.noBorderAndSpacing]: noBorderAndSpacing })}
            aria-labelledby={listItemId ?? 'list-item'}
        >
            {children}
        </li>
    );
}

export default SporsmalListItem;
