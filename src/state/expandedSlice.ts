import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ExpandedState {
  expandedSykmeldte: string[];
  expandedSykmeldtPerioder: string[];
  infoSoknaderExpanded: boolean;
}

const initialState: ExpandedState = {
  expandedSykmeldte: [],
  expandedSykmeldtPerioder: [],
  infoSoknaderExpanded: false,
};

export const expandedSlice = createSlice({
  name: "expanded",
  initialState,
  reducers: {
    setExpandSykmeldt: (state, action: PayloadAction<string>) => {
      const index = state.expandedSykmeldte.indexOf(action.payload);
      if (index < 0) {
        state.expandedSykmeldte.push(action.payload);
      }
    },
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
    toggleInfoSoknaderExpanded: (state) => {
      state.infoSoknaderExpanded = !state.infoSoknaderExpanded;
    },
  },
});

export default expandedSlice;
