import { configureStore } from '@reduxjs/toolkit';

import paginationSlice from './paginationSlice';
import filterSlice from './filterSlice';
import expandedSlice from './expandedSlice';

export const rootReducer = {
    pagination: paginationSlice.reducer,
    filter: filterSlice.reducer,
    expanded: expandedSlice.reducer,
};

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
