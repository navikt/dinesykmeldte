import { createContext, Dispatch, PropsWithChildren, useContext, useReducer } from 'react';

export interface Filters {
    name: string | null;
    show: 'all' | 'sykmeldte' | 'friskmeldte';
    sortBy: 'date' | 'name';
    dirty: boolean;
}

interface ApplicationState {
    expandedSykmeldte: string[];
    expandedSykmeldtPerioder: string[];
    infoPagesExpanded: boolean;
    /** use the hook `useSelectedVirksomhet` to get this value with a fallback value */
    virksomhet: string | null;
    filter: Filters;
}

const defaultState: ApplicationState = {
    expandedSykmeldte: [],
    expandedSykmeldtPerioder: [],
    infoPagesExpanded: false,
    virksomhet: null,
    filter: {
        name: null,
        show: 'all',
        sortBy: 'date',
        dirty: false,
    },
};

type ToggleExpandSykmeldte = {
    type: 'toggleExpandSykmeldte';
    payload: string;
};

type ToggleExpandSykmeldtPerioder = {
    type: 'toggleExpandSykmeldtPerioder';
    payload: string;
};

type ToggleInfoPagesExpanded = {
    type: 'toggleInfoPagesExpanded';
};

type SetVirksomhet = {
    type: 'setVirksomhet';
    payload: string;
};

type SetFilterName = {
    type: 'setFilterName';
    payload: string;
};

type SetShowFilter = {
    type: 'setShowFilter';
    payload: ApplicationState['filter']['show'];
};

type SetSortBy = {
    type: 'setSortBy';
    payload: ApplicationState['filter']['sortBy'];
};

type ApplicationContextActions =
    | ToggleExpandSykmeldte
    | ToggleExpandSykmeldtPerioder
    | SetFilterName
    | SetShowFilter
    | SetSortBy
    | SetVirksomhet
    | ToggleInfoPagesExpanded;

type ApplicationContextTuple = [ApplicationState, Dispatch<ApplicationContextActions>];

function expandedSykmeldteReducer(state: ApplicationState, action: ApplicationContextActions): ApplicationState {
    switch (action.type) {
        case 'setVirksomhet':
            return {
                ...state,
                virksomhet: action.payload,
                filter: defaultState.filter,
            };
        case 'setFilterName':
            return {
                ...state,
                filter: {
                    ...state.filter,
                    name: action.payload,
                    dirty: true,
                },
            };
        case 'setShowFilter':
            return {
                ...state,
                filter: {
                    ...state.filter,
                    show: action.payload,
                    dirty: true,
                },
            };
        case 'setSortBy':
            return {
                ...state,
                filter: {
                    ...state.filter,
                    sortBy: action.payload,
                    dirty: true,
                },
            };
        case 'toggleExpandSykmeldte': {
            const newArray = [...state.expandedSykmeldte];
            const index = newArray.indexOf(action.payload);
            if (index >= 0) {
                newArray.splice(index, 1);
            } else {
                newArray.push(action.payload);
            }

            return {
                ...state,
                expandedSykmeldte: newArray,
            };
        }
        case 'toggleExpandSykmeldtPerioder': {
            const newArray = [...state.expandedSykmeldtPerioder];
            const index = newArray.indexOf(action.payload);
            if (index >= 0) {
                newArray.splice(index, 1);
            } else {
                newArray.push(action.payload);
            }

            return {
                ...state,
                expandedSykmeldtPerioder: newArray,
            };
        }
        case 'toggleInfoPagesExpanded': {
            return { ...state, infoPagesExpanded: !state.infoPagesExpanded };
        }
    }
}

const StateContext = createContext<ApplicationContextTuple>([defaultState, () => void 0]);

export function useApplicationContext(): [state: ApplicationState, dispatch: Dispatch<ApplicationContextActions>] {
    return useContext(StateContext);
}

function StateProvider({ children }: PropsWithChildren<unknown>): JSX.Element {
    const reducerTuple = useReducer(expandedSykmeldteReducer, defaultState);

    return <StateContext.Provider value={reducerTuple}>{children}</StateContext.Provider>;
}

export default StateProvider;
