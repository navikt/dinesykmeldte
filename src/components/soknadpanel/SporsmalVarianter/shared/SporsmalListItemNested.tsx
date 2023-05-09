import React, { PropsWithChildren } from 'react'

interface SporsmalListItemNestedProps {
    listItemId?: string
}

function SporsmalListItemNested({ children, listItemId }: PropsWithChildren<SporsmalListItemNestedProps>): JSX.Element {
    return (
        <li className="my2" aria-labelledby={listItemId ?? 'list-item-nested'}>
            {children}
        </li>
    )
}

export default SporsmalListItemNested
