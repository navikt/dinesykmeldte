import { useSelector } from 'react-redux'
import { ReactElement } from 'react'

import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated'
import { RootState } from '../../../state/store'
import SykmeldteFilter from '../../sykmeldtefilter/SykmeldteFilter'
import useFilteredSykmeldte from '../useFilteredSykmeldte'

import PaginatedSykmeldteList from './PaginatedSykmeldteList'

interface Props {
    sykmeldte: PreviewSykmeldtFragment[]
    focusSykmeldtId: string
}

function SykmeldteNonNotifying({ sykmeldte, focusSykmeldtId }: Props): ReactElement {
    const filter = useSelector((state: RootState) => state.filter)
    const showOrgHeading = filter.show === 'sykmeldte-per-virksomhet'

    const filteredMineSykmeldte = useFilteredSykmeldte(sykmeldte)

    return (
        <>
            <SykmeldteFilter />
            <section aria-label="Sykmeldte uten varsel">
                <PaginatedSykmeldteList
                    sykmeldte={filteredMineSykmeldte}
                    focusSykmeldtId={focusSykmeldtId}
                    showOrgHeading={showOrgHeading}
                />
            </section>
        </>
    )
}

export default SykmeldteNonNotifying
