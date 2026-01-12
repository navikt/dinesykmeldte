import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isFilterAction } from "./filterSlice";

export const PAGE_SIZE_KEY = "page-size";
export const DEFAULT_PAGE_SIZE = 5;

export interface PaginationState {
  page: number;
  pageSize: number;
}

const initialState: PaginationState = {
  page: 0,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const paginationSlice = createSlice({
  name: "pagination",
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
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isFilterAction, (state) => {
      state.page = 0;
    });
  },
});

export default paginationSlice;
