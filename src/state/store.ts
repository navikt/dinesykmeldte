import { configureStore } from "@reduxjs/toolkit";
import expandedSlice from "./expandedSlice";
import filterSlice from "./filterSlice";
import metadataSlice from "./metadataSlice";
import paginationSlice from "./paginationSlice";
import sortByNotifying from "./sortByNotifyingSlice";

export const rootReducer = {
  metadata: metadataSlice.reducer,
  pagination: paginationSlice.reducer,
  filter: filterSlice.reducer,
  expanded: expandedSlice.reducer,
  sortByNotifying: sortByNotifying.reducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
