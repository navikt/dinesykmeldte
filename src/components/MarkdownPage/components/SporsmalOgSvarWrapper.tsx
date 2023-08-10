import React, { ReactElement, PropsWithChildren } from 'react'

import { cn } from '../../../utils/tw-utils'

interface SporsmalOgSvarWrapperProps {
    graaInfoPanel?: boolean
}

function SporsmalOgSvarWrapper({
    children,
    graaInfoPanel,
}: PropsWithChildren<SporsmalOgSvarWrapperProps>): ReactElement {
    return (
        <div
            className={cn('mb-10 border-b border-border-divider pb-4', {
                'mb-5 border-none bg-bg-subtle px-8 pb-4 pt-8': graaInfoPanel,
            })}
        >
            {children}
        </div>
    )
}

export default SporsmalOgSvarWrapper
