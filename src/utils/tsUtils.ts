import { getServerEnv } from './env'

export function notNull<T>(value: T): value is NonNullable<T> {
    return value != null
}

export function raise(error: Error): never {
    throw error
}

export async function isPilotUser(narmestelederId: string): Promise<boolean> {
    const response = await fetch(`${getServerEnv().DINE_SYKMELDTE_BACKEND_URL}/api/isPilotUser/${narmestelederId}`)
    if (!response.ok) throw new Error('Failed to fetch pilot user status')
    return await response.json()
}
