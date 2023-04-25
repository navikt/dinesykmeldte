import React from 'react'

interface NotifcationDotProps {
    notifications: number
    tooltip?: string
}

function NotifcationDot({ notifications, tooltip }: NotifcationDotProps): JSX.Element {
    // TODO: Sjekke hvordan title interagerer med skjermlesere her
    return (
        <div
            className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border bg-red-500 text-sm text-white"
            title={tooltip}
        >
            {notifications}
        </div>
    )
}

export default NotifcationDot
