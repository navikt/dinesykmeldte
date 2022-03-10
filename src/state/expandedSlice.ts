import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExpandedState {
    expandedSykmeldte: string[];
    expandedSykmeldtPerioder: string[];
    infoPagesExpanded: boolean;
    infoSoknaderExpanded: boolean;
}

const initialState: ExpandedState = {
    expandedSykmeldte: [],
    expandedSykmeldtPerioder: [],
    infoPagesExpanded: false,
    infoSoknaderExpanded: false,
};

export const expandedSlice = createSlice({
    name: 'expanded',
    initialState,
    reducers: {
        toggleExpandSykmeldte: (state, action: PayloadAction<string>) => {
            const index = state.expandedSykmeldte.indexOf(action.payload);
            if (index >= 0) {
                state.expandedSykmeldte.splice(index, 1);
            } else {
                state.expandedSykmeldte.push(action.payload);
            }
        },
        toggleExpandSykmeldtPerioder: (state, action: PayloadAction<string>) => {
            const index = state.expandedSykmeldtPerioder.indexOf(action.payload);
            if (index >= 0) {
                state.expandedSykmeldtPerioder.splice(index, 1);
            } else {
                state.expandedSykmeldtPerioder.push(action.payload);
            }
        },
        toggleInfoPagesExpanded: (state) => {
            state.infoPagesExpanded = !state.infoPagesExpanded;
        },
        toggleInfoSoknaderExpanded: (state) => {
            state.infoSoknaderExpanded = !state.infoSoknaderExpanded;
        },
    },
});

export default expandedSlice;
