import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MetadataState {
    version: string | null;
    stale: boolean;
    loggedOut: boolean;
}

const initialState: MetadataState = {
    version: null,
    stale: false,
    loggedOut: false,
};

export const metadataSlice = createSlice({
    name: 'metadata',
    initialState,
    reducers: {
        setVersion: (state, action: PayloadAction<string>) => {
            state.version = action.payload;
        },
        setStale: (state) => {
            state.stale = true;
        },
        setLoggedOut: (state) => {
            state.loggedOut = true;
        },
    },
});

export default metadataSlice;
