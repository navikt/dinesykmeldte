import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FilterState {
    virksomhet: string | null;
    name: string | null;
    show: 'all' | 'sykmeldte' | 'friskmeldte';
    sortBy: 'date' | 'name';
    dirty: boolean;
}

const initialState: FilterState = {
    virksomhet: null,
    name: null,
    show: 'all',
    sortBy: 'date',
    dirty: false,
};

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setVirksomhet: (state, action: PayloadAction<FilterState['virksomhet']>) => ({
            ...initialState,
            virksomhet: action.payload,
        }),
        setSortBy: (state, action: PayloadAction<FilterState['sortBy']>) => {
            state.sortBy = action.payload;
            state.dirty = true;
        },
        setShow: (state, action: PayloadAction<FilterState['show']>) => {
            state.show = action.payload;
            state.dirty = true;
        },
        setName: (state, action: PayloadAction<FilterState['name']>) => {
            state.name = action.payload;
            state.dirty = true;
        },
    },
});

export default filterSlice;
