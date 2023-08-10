import React, { ReactElement, ReactNode } from 'react'
import { BodyShort } from '@navikt/ds-react'
import { BandageIcon } from '@navikt/aksel-icons'

interface InfoItemProps {
    title: string
    text: string | ReactNode
    Icon: typeof BandageIcon
}

export function InfoItem({ title, text, Icon }: InfoItemProps): ReactElement {
    return (
        <div className="flex items-center max-[783px]:items-start">
            <Icon className="pr-4 text-4xl" role="img" aria-hidden />
            <div className="flex-col pr-10 max-[783px]:flex-col max-[783px]:pr-5">
                <BodyShort className="text-base font-semibold">{title}</BodyShort>
                <BodyShort className="text-base [&>button]:text-start">{text}</BodyShort>
            </div>
        </div>
    )
}
