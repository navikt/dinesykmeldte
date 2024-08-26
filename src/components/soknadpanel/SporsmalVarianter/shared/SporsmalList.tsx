import React, { ReactElement, ReactNode } from 'react'

interface Props {
    children: ReactNode
    className?: string
}

function SporsmalList({ children, className }: Props): ReactElement {
    return <ul className={`list-none p-0 ${className ?? ''}`}>{children}</ul>
}

export default SporsmalList
