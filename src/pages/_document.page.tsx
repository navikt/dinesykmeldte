import React from 'react'
import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document'
import { Components, fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr'

import { getPublicEnv } from '../utils/env'
import { createInitialServerSideBreadcrumbs } from '../hooks/useBreadcrumbs'

const publicEnv = getPublicEnv()

// The 'head'-field of the document initialProps contains data from <head> (meta-tags etc)
const getDocumentParameter = (initialProps: DocumentInitialProps, name: string): string => {
    return initialProps.head?.find((element) => element?.props?.name === name)?.props?.content
}

function createDecoratorEnv(ctx: DocumentContext): 'dev' | 'prod' {
    if (ctx.pathname === '/500' || ctx.pathname === '/404' || process.env.NODE_ENV === 'development') {
        // Blir statisk kompilert i GHA så må hentes defra
        return 'prod'
    }

    switch (publicEnv.runtimeEnv) {
        case 'local':
        case 'test':
        case 'dev':
            return 'dev'
        case 'labs':
        case 'prod':
            return 'prod'
    }
}

interface Props {
    Decorator: Components
    language: string
}

class MyDocument extends Document<Props> {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & Props> {
        const initialProps = await Document.getInitialProps(ctx)

        const Decorator = await fetchDecoratorReact({
            env: createDecoratorEnv(ctx),
            chatbot: true,
            context: 'arbeidsgiver',
            breadcrumbs: createInitialServerSideBreadcrumbs(ctx.pathname, ctx.query),
        })

        const language = getDocumentParameter(initialProps, 'lang')

        return { ...initialProps, Decorator, language }
    }

    render(): JSX.Element {
        const { Decorator, language } = this.props

        return (
            <Html lang={language || 'no'}>
                <Head>
                    <Decorator.Styles />
                    <link rel="icon" href="https://www.nav.no/favicon.ico" type="image/x-icon" />
                </Head>
                <body>
                    <Decorator.Header />
                    <Main />
                    <Decorator.Footer />
                    <Decorator.Scripts />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
