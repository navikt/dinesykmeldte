import React, { ReactElement, PropsWithChildren } from 'react'

interface SporsmalListItemProps {
    listItemId?: string
}

function SporsmalListItem({ children, listItemId }: PropsWithChildren<SporsmalListItemProps>): ReactElement {
    return (
        <li
            className="mb-4 rounded bg-blue-50 p-5 [&_li:first-of-type]:mt-0 [&_li:last-of-type]:mb-0"
            aria-labelledby={listItemId ?? 'list-item'}
        >
            {children}
        </li>
    )
}

export default SporsmalListItem
