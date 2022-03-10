import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import expandedSlice from '../../state/expandedSlice';
import { RootState } from '../../state/store';

type ToggleExpand = (id: string, where: 'root' | 'periods') => void;

export function useExpandSykmeldte(): ToggleExpand {
    const dispatch = useDispatch();
    return useCallback(
        (id, where) => {
            if (where === 'root') {
                dispatch(expandedSlice.actions.toggleExpandSykmeldte(id));
            } else {
                dispatch(expandedSlice.actions.toggleExpandSykmeldtPerioder(id));
            }
        },
        [dispatch],
    );
}

export function useExpanded(): { expandedSykmeldte: string[]; expandedSykmeldtPerioder: string[] } {
    const expandedSykmeldte = useSelector((state: RootState) => state.expanded.expandedSykmeldte);
    const expandedSykmeldtPerioder = useSelector((state: RootState) => state.expanded.expandedSykmeldtPerioder);

    return { expandedSykmeldte, expandedSykmeldtPerioder };
}
