import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PaginationState {
    page: number;
}

const initialState: PaginationState = {
    page: 0,
};

export const paginationSlice = createSlice({
    name: 'pagination',
    initialState,
    reducers: {
        next: (state) => {
            state.page += 1;
        },
        previous: (state) => {
            state.page -= 1;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
    },
});

export default paginationSlice;
