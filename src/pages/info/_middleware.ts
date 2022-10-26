import type { NextRequest } from 'next/server'

import { registerClientMetric } from '../../utils/clientMetric'

const PUBLIC_FILE = /\.(.*)$/

export function middleware(req: NextRequest): void {
    // Only register actual pages, no other random files
    if (!PUBLIC_FILE.test(req.nextUrl.pathname)) {
        registerClientMetric({ type: 'info-page', path: req.nextUrl.pathname })
    }
}
