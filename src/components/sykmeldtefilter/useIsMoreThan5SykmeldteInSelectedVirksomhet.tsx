import { useQuery } from '@apollo/client'

import useSelectedVirksomhet from '../../hooks/useSelectedSykmeldt'
import { filterSykmeldteByOrg } from '../sykmeldte/useFilteredSykmeldte'
import { MineSykmeldteDocument } from '../../graphql/queries/graphql.generated'

export function useIsMoreThan5SykmeldteInSelectedVirksomhet(): boolean {
    const { data } = useQuery(MineSykmeldteDocument)
    const selectedVirksomhet = useSelectedVirksomhet()

    if (!data?.mineSykmeldte?.length) return false

    return filterSykmeldteByOrg(selectedVirksomhet, data.mineSykmeldte).length >= 5
}
