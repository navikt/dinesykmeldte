import { IToggle } from '@unleash/nextjs'

import { browserEnv } from '../utils/env'

import { EXPECTED_TOGGLES } from './toggles'

export function localDevelopmentToggles(): IToggle[] {
    return EXPECTED_TOGGLES.map(
        (it): IToggle => ({
            name: it,
            enabled: true,
            impressionData: false,
            variant: {
                name: 'disabled',
                enabled: false,
            },
        }),
    )
}

export function getUnleashEnvironment(): 'development' | 'production' {
    switch (browserEnv.runtimeEnv) {
        case 'dev':
        case 'test':
        case 'local':
        case 'demo':
            return 'development'
        case 'prod':
            return 'production'
    }
}
