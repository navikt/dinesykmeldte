import { Table } from '@navikt/ds-react'

import { SykmeldingPeriodeFragment } from '../../../../../graphql/queries/graphql.generated'
import { formatDatePeriod } from '../../../../../utils/dateUtils'
import {
    createPeriodeKey,
    getRelativeSykmeldingPeriodStatus,
    getShortSykmeldingPeriodDescription,
} from '../../../../../utils/sykmeldingPeriodUtils'

interface Props {
    perioder: SykmeldingPeriodeFragment[]
}

function PeriodSummaryTable({ perioder }: Props): JSX.Element {
    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Sykmeldingsperiode</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {perioder.map((it) => (
                    <Table.Row key={createPeriodeKey(it)}>
                        <Table.DataCell>{formatDatePeriod(it.fom, it.tom)}</Table.DataCell>
                        <Table.DataCell>{getShortSykmeldingPeriodDescription(it)}</Table.DataCell>
                        <Table.DataCell>{getRelativeSykmeldingPeriodStatus(it)}</Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    )
}

export default PeriodSummaryTable
