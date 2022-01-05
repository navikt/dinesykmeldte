import { createContext, Dispatch, PropsWithChildren, useContext, useReducer } from 'react';

interface ApplicationState {
    expandedSykmeldte: string[];
}

const defaultState: ApplicationState = {
    expandedSykmeldte: [],
};

type ToggleExpandSykmeldte = {
    type: 'toggleExpandSykmeldte';
    payload: string;
};

type ClearAllExpanded = {
    type: 'clearAll';
};

type ApplicationContextActions = ToggleExpandSykmeldte | ClearAllExpanded;

type ApplicationContextTuple = [ApplicationState, Dispatch<ApplicationContextActions>];

function expandedSykmeldteReducer(state: ApplicationState, action: ApplicationContextActions): ApplicationState {
    switch (action.type) {
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
        case 'clearAll':
            return {
                ...state,
                expandedSykmeldte: [],
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
