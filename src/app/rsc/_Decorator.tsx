import React, { PropsWithChildren, JSX } from 'react'
import parse from 'html-react-parser'

import { fetchDecoratorHtml } from './_fetch-decorator'
import { DecoratorFetchProps } from './_common-types'

interface RscDecoratorProps {
    decoratorProps: DecoratorFetchProps
}

async function Decorator({ children, decoratorProps }: PropsWithChildren<RscDecoratorProps>): Promise<JSX.Element> {
    const Decorator = await fetchDecoratorHtml(decoratorProps)

    return (
        <>
            <head>{parse(Decorator.DECORATOR_STYLES, { trim: true })}</head>
            <body>
                <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: Decorator.DECORATOR_HEADER }} />
                {children}
                <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: Decorator.DECORATOR_FOOTER }} />
                {parse(Decorator.DECORATOR_SCRIPTS, { trim: true })}
            </body>
        </>
    )
}

export default Decorator
