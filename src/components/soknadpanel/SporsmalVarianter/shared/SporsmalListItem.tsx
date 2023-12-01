import React, { ReactElement, PropsWithChildren } from 'react'

interface SporsmalListItemProps {
    listItemId?: string
}

function SporsmalListItem({ children, listItemId }: PropsWithChildren<SporsmalListItemProps>): ReactElement {
    return (
        <li className="py-5 px-7 bg-gray-50 rounded print:py-0 mb-5" aria-labelledby={listItemId ?? 'list-item'}>
            {children}
        </li>
    )
}

export default SporsmalListItem
