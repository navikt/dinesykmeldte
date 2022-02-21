import { useCallback } from 'react';

import { useApplicationContext } from '../shared/StateProvider';

interface UseFilterChangeHandlers {
    handleNameFilterChange: (name: string) => void;
    handleShowChange: (show: string) => void;
    handleSortChange: (sortBy: string) => void;
}

export function useFilterChangeHandlers(): UseFilterChangeHandlers {
    const [, dispatch] = useApplicationContext();
    const handleNameFilterChange = useCallback(
        (name: string) => dispatch({ type: 'setFilterName', payload: name }),
        [dispatch],
    );
    const handleShowChange = useCallback(
        (show: string) => {
            if (show !== 'all' && show !== 'sykmeldte' && show !== 'friskmeldte')
                throw Error(`Invalid show value (${show ?? '[Missing]'})`);

            dispatch({ type: 'setShowFilter', payload: show });
        },
        [dispatch],
    );
    const handleSortChange = useCallback(
        (sortBy: string) => {
            if (sortBy !== 'date' && sortBy !== 'name') throw Error('Invalid sort by value value');

            dispatch({ type: 'setSortBy', payload: sortBy });
        },
        [dispatch],
    );

    return { handleNameFilterChange, handleShowChange, handleSortChange };
}
