import React, { ReactElement, PropsWithChildren } from 'react'

function SporsmalList({ children }: PropsWithChildren<unknown>): ReactElement {
    return <ul className="list-none p-0">{children}</ul>
}

export default SporsmalList
