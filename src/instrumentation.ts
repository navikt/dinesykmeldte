export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('pino')
        await import('next-logger')
    }
}
