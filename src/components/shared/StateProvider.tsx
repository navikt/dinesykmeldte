import { createContext, Dispatch, PropsWithChildren, useContext, useReducer } from 'react';

export interface Filters {
    name: string | null;
    show: 'all' | 'sykmeldte' | 'friskmeldte';
    sortBy: 'date' | 'name';
    dirty: boolean;
}

interface ApplicationState {
    expandedSykmeldte: string[];
    filter: Filters;
}

const defaultState: ApplicationState = {
    expandedSykmeldte: [],
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

type FilterName = {
    type: 'filterName';
    payload: string;
};

type ShowFilter = {
    type: 'showFilter';
    payload: ApplicationState['filter']['show'];
};

type SortBy = {
    type: 'sortBy';
    payload: ApplicationState['filter']['sortBy'];
};

type ApplicationContextActions = ToggleExpandSykmeldte | FilterName | ShowFilter | SortBy;

type ApplicationContextTuple = [ApplicationState, Dispatch<ApplicationContextActions>];

function expandedSykmeldteReducer(state: ApplicationState, action: ApplicationContextActions): ApplicationState {
    switch (action.type) {
        case 'filterName':
            return {
                ...state,
                filter: {
                    ...state.filter,
                    name: action.payload,
                    dirty: true,
                },
            };
        case 'showFilter':
            return {
                ...state,
                filter: {
                    ...state.filter,
                    show: action.payload,
                    dirty: true,
                },
            };
        case 'sortBy':
            return {
                ...state,
                filter: {
                    ...state.filter,
                    sortBy: action.payload,
                    dirty: true,
                },
            };
        case 'toggleExpandSykmeldte':
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
}

const StateContext = createContext<ApplicationContextTuple>([defaultState, () => void 0]);

export function useApplicationContext(): [state: ApplicationState, dispatch: Dispatch<ApplicationContextActions>] {
    return useContext(StateContext);
}

function StateProvider({ children }: PropsWithChildren<unknown>) {
    const reducerTuple = useReducer(expandedSykmeldteReducer, defaultState);

    return <StateContext.Provider value={reducerTuple}>{children}</StateContext.Provider>;
}

export default StateProvider;
