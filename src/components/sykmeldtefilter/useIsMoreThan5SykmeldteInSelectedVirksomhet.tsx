import { useMineSykmeldteQuery } from '../../graphql/queries/react-query.generated';
import useSelectedVirksomhet from '../../hooks/useSelectedSykmeldt';
import { filterSykmeldteByOrg } from '../sykmeldte/useFilteredSykmeldte';

export function useIsMoreThan5SykmeldteInSelectedVirksomhet(): boolean {
    const { data } = useMineSykmeldteQuery();
    const selectedVirksomhet = useSelectedVirksomhet();

    if (!data?.mineSykmeldte?.length) return false;

    return filterSykmeldteByOrg(selectedVirksomhet, data.mineSykmeldte).length >= 5;
}
