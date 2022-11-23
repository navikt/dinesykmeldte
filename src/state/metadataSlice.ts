import { logger } from '@navikt/next-logger'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MetadataState {
    version: string | null
    stale: boolean
    loggedOut: boolean
    dialogmoteFeature: 'landing-page' | 'sykmeldinger' | 'none'
}

const initialState: MetadataState = {
    version: null,
    stale: false,
    loggedOut: false,
    dialogmoteFeature: getDialogmoteFeatureFromCookie(),
}

export const metadataSlice = createSlice({
    name: 'metadata',
    initialState,
    reducers: {
        setVersion: (state, action: PayloadAction<string>) => {
            state.version = action.payload
        },
        setStale: (state) => {
            state.stale = true
        },
        setLoggedOut: (state) => {
            state.loggedOut = true
        },
    },
})

function getDialogmoteFeatureFromCookie(): MetadataState['dialogmoteFeature'] {
    if (typeof window === 'undefined' || !document.cookie) {
        return 'none'
    }

    const featureGroup: number = +(
        document.cookie
            .split(';')
            .find((cookie) => cookie.trim().startsWith('dialogmote-feature-group'))
            ?.split('=')[1] ?? '0'
    )

    switch (featureGroup) {
        case 0:
            return 'none'
        case 1:
            return 'landing-page'
        case 2:
            return 'sykmeldinger'
        default:
            logger.warn(`Invalid dialogmote-feature-group cookie value (${featureGroup}), defaulting to 'none'`)
            return 'none'
    }
}

export default metadataSlice
