import { JSDOM } from 'jsdom'
import { DecoratorFetchProps } from '@navikt/nav-dekoratoren-moduler/ssr'
import { logger } from '@navikt/next-logger'

import { getDecoratorUrl } from './_urls'

export type DecoratorElements = {
    DECORATOR_STYLES: string
    DECORATOR_SCRIPTS: string
    DECORATOR_HEADER: string
    DECORATOR_FOOTER: string
}

const fetchDecorator = async (url: string, props: DecoratorFetchProps, retries = 3): Promise<DecoratorElements> => {
    let tryCount = 0

    const fetchAndParse = async (): Promise<DecoratorElements> => {
        if (tryCount >= retries) {
            throw new Error('Failed to fetch decorator after 3 retries')
        }

        try {
            const response = await fetch(url, {
                next: { revalidate: 15 * 60 },
            })

            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`)
            }

            const result = await response.text()

            return parseDom(result)
        } catch (e) {
            logger.error(new Error(`Failed to fetch decorator (try ${tryCount}), retrying...`, { cause: e }))

            tryCount++
            return fetchAndParse()
        }
    }

    return fetchAndParse()
}

function parseDom(dom: string): DecoratorElements {
    const { document } = new JSDOM(dom).window

    const styles = document.getElementById('styles')?.innerHTML
    if (!styles) {
        throw new Error('Decorator styles element not found!')
    }

    const scripts = document.getElementById('scripts')?.innerHTML
    if (!scripts) {
        throw new Error('Decorator scripts element not found!')
    }

    const header = document.getElementById('header-withmenu')?.innerHTML
    if (!header) {
        throw new Error('Decorator header element not found!')
    }

    const footer = document.getElementById('footer-withmenu')?.innerHTML
    if (!footer) {
        throw new Error('Decorator footer element not found!')
    }

    return {
        DECORATOR_STYLES: styles.trim(),
        DECORATOR_SCRIPTS: scripts.trim(),
        DECORATOR_HEADER: header.trim(),
        DECORATOR_FOOTER: footer.trim(),
    }
}

export const fetchDecoratorHtml = async (props: DecoratorFetchProps): Promise<DecoratorElements> => {
    const url: string = getDecoratorUrl(props)
    return fetchDecorator(url, props).catch((e) => {
        // eslint-disable-next-line no-console
        console.error(
            `Failed to fetch decorator, falling back to elements for client-side rendering - Url: ${url} - Error: ${e}`,
        )

        throw e
    })
}
