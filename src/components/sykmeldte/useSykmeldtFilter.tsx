import { useEffect, useState } from 'react';

import { Filters, useApplicationContext } from '../shared/StateProvider';
import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { sortByDate, sortByName } from '../../utils/sykmeldtUtils';

function filterByName(filters: Filters) {
    return async (sykmeldte: PreviewSykmeldtFragment[]): Promise<PreviewSykmeldtFragment[]> => {
        if (!filters.name) return sykmeldte;

        const value = filters.name;
        const Fuse = (await import('fuse.js')).default;
        const fuse = new Fuse(sykmeldte, { keys: ['navn'] });

        const result = fuse.search(value);
        return result.map((it) => it.item);
    };
}

function sortBy(filters: Filters) {
    return (sykmeldte: readonly PreviewSykmeldtFragment[]): PreviewSykmeldtFragment[] => {
        switch (filters.sortBy) {
            case 'date':
                return [...sykmeldte].sort(sortByDate);
            case 'name':
                return [...sykmeldte].sort(sortByName);
        }
    };
}

const filterByShow = (filters: Filters) => {
    return (sykmeldte: PreviewSykmeldtFragment[]): PreviewSykmeldtFragment[] => {
        switch (filters.show) {
            case 'all':
                return sykmeldte;
            case 'sykmeldte':
                return sykmeldte.filter((it) => !it.friskmeldt);
            case 'friskmeldte':
                return sykmeldte.filter((it) => it.friskmeldt);
        }
    };
};

function useSykmeldtFilter(sykmeldte?: PreviewSykmeldtFragment[] | null): PreviewSykmeldtFragment[] {
    const [state] = useApplicationContext();
    const [filterResult, setFilterResult] = useState(sortBy(state.filter)(sykmeldte ?? []));

    useEffect(() => {
        (async () => {
            if (!state.filter.dirty) return;

            const filteredByName = await filterByName(state.filter)(sykmeldte ?? []);
            const filteredByShow = filterByShow(state.filter)(filteredByName);
            const sorted = sortBy(state.filter)(filteredByShow);

            setFilterResult(sorted);
        })();
    }, [sykmeldte, state.filter]);

    return filterResult ?? [];
}

export default useSykmeldtFilter;
