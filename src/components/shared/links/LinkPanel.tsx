import Link, { LinkProps } from 'next/link'
import React, { ReactElement } from 'react'
import { ButtonProps, Detail, LinkPanel as DsLinkPanel } from '@navikt/ds-react'
import { BandageIcon } from '@navikt/aksel-icons'

import { cn } from '../../../utils/tw-utils'
import { browserEnv } from '../../../utils/env'

type LinkPanelProps = {
    /* Any icon from @navikt/aksel-icons will match this typing  */
    Icon: typeof BandageIcon
    children: string
    description?: React.ReactNode
    notify?:
        | boolean
        | {
              notify: boolean
              disableWarningBackground: boolean
          }
    detail?: string
    tag?: React.ReactNode
    external?: 'proxy' | 'absolute' | null
}

export function ButtonPanel({
    onClick,
    children,
    description,
    detail,
    tag,
    notify,
    Icon,
}: Omit<LinkPanelProps, 'external'> & Pick<ButtonProps, 'onClick'>): ReactElement {
    const { shouldNotify, shouldNotifyBg } = getNotifyOptions(notify)

    return (
        <DsLinkPanel
            as="button"
            // @ts-expect-error LinkPanel doesn't infer onClick type correctly when using `as`
            onClick={onClick}
            className={cn('w-full no-underline [&>div]:flex [&>div]:w-full [&>div]:items-center', {
                'border-orange-400': shouldNotify,
                'bg-orange-50': shouldNotifyBg,
            })}
        >
            <PanelContent shouldNotify={shouldNotify} description={description} detail={detail} tag={tag} Icon={Icon}>
                {children}
            </PanelContent>
        </DsLinkPanel>
    )
}

export function LinkPanel({
    href,
    children,
    description,
    detail,
    tag,
    notify,
    Icon,
    external = null,
}: LinkPanelProps & Pick<LinkProps, 'href'>): ReactElement {
    const { shouldNotify, shouldNotifyBg } = getNotifyOptions(notify)

    const panel = (
        <PanelContent shouldNotify={shouldNotify} description={description} detail={detail} tag={tag} Icon={Icon}>
            {children}
        </PanelContent>
    )

    if (external === 'proxy') {
        const url = `${browserEnv.publicPath ?? ''}${href.toString()}`
        return (
            <DsLinkPanel
                className={cn('w-full no-underline [&>div]:flex [&>div]:w-full [&>div]:items-center', {
                    'border-orange-400': shouldNotify,
                    'bg-orange-50': shouldNotifyBg,
                })}
                href={url}
            >
                {panel}
            </DsLinkPanel>
        )
    }

    if (external) {
        return (
            <DsLinkPanel
                className={cn('w-full no-underline [&>div]:flex [&>div]:w-full [&>div]:items-center', {
                    'border-orange-400': shouldNotify,
                    'bg-orange-50': shouldNotifyBg,
                })}
                target="_blank"
                href={href.toString()}
                rel="noopener noreferrer"
            >
                {panel}
            </DsLinkPanel>
        )
    }

    return (
        <Link href={href} passHref legacyBehavior>
            <DsLinkPanel
                className={cn('w-full no-underline [&>div]:flex [&>div]:w-full [&>div]:items-center', {
                    'border-orange-400': shouldNotify,
                    'bg-orange-50': shouldNotifyBg,
                })}
            >
                {panel}
            </DsLinkPanel>
        </Link>
    )
}

function PanelContent({
    children,
    shouldNotify,
    description,
    detail,
    tag,
    Icon,
}: { shouldNotify: boolean } & Pick<
    LinkPanelProps,
    'children' | 'description' | 'detail' | 'tag' | 'Icon'
>): ReactElement {
    return (
        <>
            <Icon
                className={cn('min-w-6 mb-2 ml-2 mr-4 mt-1 h-6 w-6 self-start', {
                    'text-orange-400': shouldNotify,
                    'mt-2': !description,
                })}
                role="img"
                aria-hidden
            />
            <div className="flex flex-[1_0_90%] items-center justify-between text-left max-[720px]:flex max-[720px]:flex-col max-[720px]:items-start">
                <div className="flex-grow">
                    {detail && <Detail>{detail}</Detail>}
                    <DsLinkPanel.Title className="max-[370px]:text-base">{children}</DsLinkPanel.Title>
                    {description && (
                        <DsLinkPanel.Description className="mt-0 text-sm">{description}</DsLinkPanel.Description>
                    )}
                </div>
                {tag && <div>{tag}</div>}
            </div>
        </>
    )
}

function getNotifyOptions(notify?: boolean | { notify: boolean; disableWarningBackground: boolean }): {
    shouldNotify: boolean
    shouldNotifyBg: boolean
} {
    if (typeof notify === 'object') {
        return { shouldNotify: notify.notify, shouldNotifyBg: !notify.disableWarningBackground }
    } else {
        return { shouldNotify: notify ?? false, shouldNotifyBg: notify ?? false }
    }
}

export default LinkPanel
