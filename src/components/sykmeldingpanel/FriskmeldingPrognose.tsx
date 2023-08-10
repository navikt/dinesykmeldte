import { ClockDashedIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import CheckboxExplanation from '../shared/checkboxexplanation/CheckboxExplanation'
import { ListItem } from '../shared/listItem/ListItem'

interface Props {
    sykmelding: SykmeldingFragment
}

const title = 'Friskmelding/Prognose'

function FriskmeldingPrognose({ sykmelding }: Props): ReactElement {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={ClockDashedIcon} />
            <ul className="list-none rounded bg-blue-50 p-5">
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
