import React from 'react'
import cn from 'classnames'

import styles from './NotifcationDot.module.css'

interface NotifcationDotProps {
    notifications: number
    tooltip?: string
    absolute?: boolean
}

function NotifcationDot({ notifications, tooltip, absolute }: NotifcationDotProps): JSX.Element {
    // TODO: Sjekke hvordan title interagerer med skjermlesere her
    return (
        <div className={cn(styles.notifcationDot, { [styles.absolute]: absolute })} title={tooltip}>
            {notifications}
        </div>
    )
}

export default NotifcationDot
