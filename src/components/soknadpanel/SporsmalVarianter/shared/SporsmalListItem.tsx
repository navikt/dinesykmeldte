import React, { PropsWithChildren } from 'react';

interface SporsmalListItemProps {
    listItemId?: string;
}

function SporsmalListItem({ children, listItemId }: PropsWithChildren<SporsmalListItemProps>): JSX.Element {
    return <li aria-labelledby={listItemId ?? 'list-item'}>{children}</li>;
}

export default SporsmalListItem;
