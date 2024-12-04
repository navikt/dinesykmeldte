import { Buildings2Icon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { createPeriodeKey } from '../../utils/sykmeldingPeriodUtils'

import MulighetForArbeid from './sykmeldingperiode/MulighetForArbeid'

interface Props {
    sykmelding: SykmeldingFragment
}

const title = 'Muligheter for arbeid'

function MulighetForArbeidList({ sykmelding }: Props): ReactElement {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={Buildings2Icon} />
            <ul className="list-none [&_li:not(:last-of-type)]:mb-6">
                {sykmelding.perioder.map((it) => (
                    <MulighetForArbeid key={createPeriodeKey(it)} periode={it} />
                ))}
            </ul>
        </li>
    )
}

export default MulighetForArbeidList
