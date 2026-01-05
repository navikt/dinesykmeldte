import { browserEnv } from './env'

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
