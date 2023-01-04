import { Historic } from '@navikt/ds-icons'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import CheckboxExplanation from '../shared/checkboxexplanation/CheckboxExplanation'
import { ListItem } from '../shared/listItem/ListItem'

import styles from './FriskmeldingPrognose.module.css'

interface Props {
    sykmelding: SykmeldingFragment
}

const title = 'Friskmelding/Prognose'

function FriskmeldingPrognose({ sykmelding }: Props): JSX.Element {
    const listItemId = cleanId(title)

    return (
        <li className={styles.friskmeldingPrognose} aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={Historic} />
            <ul className={styles.friskmeldingPrognoseList}>
                {sykmelding.arbeidsforEtterPeriode != null && (
                    <li>
                        <CheckboxExplanation
                            text={
                                sykmelding.arbeidsforEtterPeriode
                                    ? 'Pasienten er 100% arbeidsfør etter denne perioden'
                                    : 'Pasienten er ikke arbeidsfør etter denne perioden'
                            }
                        />
                    </li>
                )}
                <ListItem
                    title="Eventuelle hensyn som må tas på arbeidsplassen"
                    text={sykmelding.tiltakArbeidsplassen ?? 'Ingen hensyn spesifisert'}
                    headingLevel="4"
                />
            </ul>
        </li>
    )
}

export default FriskmeldingPrognose
