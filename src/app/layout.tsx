import '../style/global.css'

import { PropsWithChildren } from 'react'

import { browserEnv } from '../utils/env'

import { DecoratorNaisEnv } from './rsc/_common-types'
import Decorator from './rsc/_Decorator'

export const metadata = {
    title: 'Dine Sykmeldte | nav.no',
    description: 'Din bedrifts oversikt over sykmeldte',
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: PropsWithChildren): Promise<JSX.Element> {
    return (
        <html lang="en">
            {/* @ts-expect-error Async Server Component */}
            <Decorator
                decoratorProps={{
                    env: getDecoratorEnv(),
                    params: {
                        chatbot: true,
                        context: 'arbeidsgiver',
                    },
                }}
            >
                {children}
            </Decorator>
        </html>
    )
}

function getDecoratorEnv(): DecoratorNaisEnv {
    switch (browserEnv.runtimeEnv) {
        case 'local':
        case 'test':
        case 'dev':
            return 'dev'
        case 'demo':
        case 'prod':
            return 'prod'
        default:
            throw new Error(`Unknown runtime environment: ${browserEnv.runtimeEnv}`)
    }
}
