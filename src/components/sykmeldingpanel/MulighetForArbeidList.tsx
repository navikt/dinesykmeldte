import { Office2 } from '@navikt/ds-icons'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { createPeriodeKey } from '../../utils/sykmeldingPeriodUtils'

import MulighetForArbeid from './sykmeldingperiode/MulighetForArbeid'

interface Props {
    sykmelding: SykmeldingFragment
}

const title = 'Muligheter for arbeid'

function MulighetForArbeidList({ sykmelding }: Props): JSX.Element {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={Office2} />
            <ul className="list-none rounded bg-blue-50 p-5 [&_li:not(:last-of-type)]:mb-8">
                {sykmelding.perioder.map((it) => (
                    <MulighetForArbeid key={createPeriodeKey(it)} periode={it} />
                ))}
            </ul>
        </li>
    )
}

export default MulighetForArbeidList
