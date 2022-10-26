import React, { PropsWithChildren } from 'react'
import cn from 'classnames'

import styles from './SporsmalOgSvarWrapper.module.css'

interface SporsmalOgSvarWrapperProps {
    graaInfoPanel?: boolean
}

function SporsmalOgSvarWrapper({
    children,
    graaInfoPanel,
}: PropsWithChildren<SporsmalOgSvarWrapperProps>): JSX.Element {
    return <div className={cn(styles.root, { [styles.graaInfoPanel]: graaInfoPanel })}>{children}</div>
}

export default SporsmalOgSvarWrapper
