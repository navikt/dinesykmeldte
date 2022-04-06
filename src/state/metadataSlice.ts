import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MetadataState {
    version: string | null;
    stale: boolean;
}

const initialState: MetadataState = {
    version: null,
    stale: false,
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
    },
});

export default metadataSlice;
