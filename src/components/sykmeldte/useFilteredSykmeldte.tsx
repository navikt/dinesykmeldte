import { useEffect, useState } from 'react';

import { Filters, useApplicationContext } from '../shared/StateProvider';
import { PreviewSykmeldtFragment } from '../../graphql/queries/react-query.generated';
import { sortByDate, sortByName } from '../../utils/sykmeldtUtils';
import useSelectedVirksomhet from '../../hooks/useSelectedSykmeldt';

async function fuzzyFilterSykmeldteByName(
    filters: Filters,
    sykmeldte: PreviewSykmeldtFragment[],
): Promise<PreviewSykmeldtFragment[]> {
    if (!filters.name) return sykmeldte;

    const value = filters.name;
    const Fuse = (await import('fuse.js')).default;
    const fuse = new Fuse(sykmeldte, { keys: ['navn'] });

    const result = fuse.search(value);
    return result.map((it) => it.item);
}

function sortSykmeldteBySelectedSort(
    filters: Filters,
    sykmeldte: PreviewSykmeldtFragment[],
): PreviewSykmeldtFragment[] {
    switch (filters.sortBy) {
        case 'date':
            return [...sykmeldte].sort(sortByDate);
        case 'name':
            return [...sykmeldte].sort(sortByName);
    }
}

function filterSykmeldteBySelectedFilter(
    filters: Filters,
    sykmeldte: PreviewSykmeldtFragment[],
): PreviewSykmeldtFragment[] {
    switch (filters.show) {
        case 'all':
            return sykmeldte;
        case 'sykmeldte':
            return sykmeldte.filter((it) => !it.friskmeldt);
        case 'friskmeldte':
            return sykmeldte.filter((it) => it.friskmeldt);
    }
}

export function filterSykmeldteByOrg(
    selectedOrg: string,
    sykmeldte: PreviewSykmeldtFragment[],
): PreviewSykmeldtFragment[] {
    return sykmeldte.filter((it) => it.orgnummer === selectedOrg);
}

function useFilteredSykmeldte(sykmeldte?: PreviewSykmeldtFragment[] | null): PreviewSykmeldtFragment[] {
    const [state] = useApplicationContext();
    const virksomhet = useSelectedVirksomhet();
    const [filterResult, setFilterResult] = useState(
        sortSykmeldteBySelectedSort(state.filter, filterSykmeldteByOrg(virksomhet, sykmeldte ?? [])),
    );

    useEffect(() => {
        (async () => {
            const filteredByOrg = filterSykmeldteByOrg(virksomhet, sykmeldte ?? []);

            if (!state.filter.dirty) {
                setFilterResult(filteredByOrg);
                return;
            }

            const filteredByName = await fuzzyFilterSykmeldteByName(state.filter, filteredByOrg);
            const filteredByShow = filterSykmeldteBySelectedFilter(state.filter, filteredByName);
            const sorted = sortSykmeldteBySelectedSort(state.filter, filteredByShow);

            setFilterResult(sorted);
        })();
    }, [sykmeldte, state.filter, state.virksomhet, virksomhet]);

    return filterResult ?? [];
}

export default useFilteredSykmeldte;
