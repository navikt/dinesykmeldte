import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';
import { sortByDate, sortByName } from '../../utils/sykmeldtUtils';
import useSelectedVirksomhet from '../../hooks/useSelectedSykmeldt';
import { RootState } from '../../state/store';
import { FilterState } from '../../state/filterSlice';

async function fuzzyFilterSykmeldteByName(
    filters: FilterState,
    sykmeldte: PreviewSykmeldtFragment[],
): Promise<PreviewSykmeldtFragment[]> {
    if (!filters.name) return sykmeldte;

    const value = filters.name;
    const Fuse = (await import('fuse.js')).default;
    const fuse = new Fuse(sykmeldte, { keys: ['navn'], threshold: 0.4 });

    const result = fuse.search(value);
    return result.map((it) => it.item);
}

function sortSykmeldteBySelectedSort(
    filters: FilterState,
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
    filters: FilterState,
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

function initialFilterSort(
    filter: FilterState,
    virksomhet: string,
    sykmeldte: PreviewSykmeldtFragment[] | null | undefined,
): PreviewSykmeldtFragment[] {
    const filteredByOrg = filterSykmeldteByOrg(virksomhet, sykmeldte ?? []);
    return sortSykmeldteBySelectedSort(filter, filteredByOrg);
}

function useFilteredSykmeldte(sykmeldte?: PreviewSykmeldtFragment[] | null): PreviewSykmeldtFragment[] {
    const filter = useSelector((state: RootState) => state.filter);
    const virksomhet = useSelectedVirksomhet();
    const [filterResult, setFilterResult] = useState(initialFilterSort(filter, virksomhet, sykmeldte));

    useEffect(() => {
        (async () => {
            if (!filter.dirty) {
                setFilterResult(initialFilterSort(filter, virksomhet, sykmeldte ?? []));
                return;
            }

            const filteredByOrg = filterSykmeldteByOrg(virksomhet, sykmeldte ?? []);
            const filteredByName = await fuzzyFilterSykmeldteByName(filter, filteredByOrg);
            const filteredByShow = filterSykmeldteBySelectedFilter(filter, filteredByName);
            const sorted = sortSykmeldteBySelectedSort(filter, filteredByShow);

            setFilterResult(sorted);
        })();
    }, [sykmeldte, filter, virksomhet]);

    return filterResult ?? [];
}

export default useFilteredSykmeldte;
