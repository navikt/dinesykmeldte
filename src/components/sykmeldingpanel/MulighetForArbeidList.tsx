import { Office2 } from '@navikt/ds-icons'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { createPeriodeKey } from '../../utils/sykmeldingPeriodUtils'

import MulighetForArbeid from './sykmeldingperiode/MulighetForArbeid'
import styles from './MulighetForArbeidList.module.css'

interface Props {
    sykmelding: SykmeldingFragment
}

const title = 'Muligheter for arbeid'

function MulighetForArbeidList({ sykmelding }: Props): JSX.Element {
    const listItemId = cleanId(title)

    return (
        <li className={styles.mulighetForArbeidList} aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={Office2} />
            <ul className={styles.list}>
                {sykmelding.perioder.map((it) => (
                    <MulighetForArbeid key={createPeriodeKey(it)} periode={it} />
                ))}
            </ul>
        </li>
    )
}

export default MulighetForArbeidList
