import { browserEnv, isLocalOrDemo } from './env'

const basePath = browserEnv.publicPath ?? ''

/**
 * Marks hendelser as resolved using fetch with keepalive (fire-and-forget).
 * The keepalive flag ensures the request completes even during page navigation.
 */
export function markHendelserResolved(hendelseIds: string[]): void {
    if (hendelseIds.length === 0) return

    const url = `${basePath}/api/mark-hendelser-resolved`

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({ hendelseIds }),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
    }).catch(() => {
        // Silently fail - this is fire-and-forget
        // If it fails, the hendelse will still show as unread, which is acceptable
    })
}

export function getDialogmoterUrl(narmestelederId: string, source?: string): string {
    const baseUrl = isLocalOrDemo
        ? `https://demo.ekstern.dev.nav.no/syk/dialogmoter/arbeidsgiver/${narmestelederId}`
        : `/syk/dialogmoter/arbeidsgiver/${narmestelederId}`

    return source ? `${baseUrl}?source=${source}` : baseUrl
}

export function getOppfolgingsplanUrl(narmestelederId: string, source?: string): string {
    const baseUrl = isLocalOrDemo
        ? `https://demo.ekstern.dev.nav.no/syk/oppfolgingsplaner/arbeidsgiver/${narmestelederId}`
        : `/syk/oppfolgingsplaner/arbeidsgiver/${narmestelederId}`

    return source ? `${baseUrl}?source=${source}` : baseUrl
}
