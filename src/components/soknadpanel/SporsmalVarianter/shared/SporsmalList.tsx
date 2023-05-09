import React, { PropsWithChildren } from 'react'

function SporsmalList({ children }: PropsWithChildren<unknown>): JSX.Element {
    return <ul className="list-none p-0">{children}</ul>
}

export default SporsmalList
