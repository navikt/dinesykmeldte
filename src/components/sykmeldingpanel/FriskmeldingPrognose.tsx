import { ClockDashedIcon } from '@navikt/aksel-icons'
import { ReactElement } from 'react'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import CheckboxExplanation from '../shared/checkboxexplanation/CheckboxExplanation'
import { ListItem } from '../shared/listItem/ListItem'
import SykmeldingInfoMissing from '../shared/SykmeldingInfoMissing'

interface Props {
    sykmelding: SykmeldingFragment
}

const title = 'Friskmelding/Prognose'

function FriskmeldingPrognose({ sykmelding }: Props): ReactElement {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={ClockDashedIcon} />
            <ul className="list-none py-5 px-7 bg-gray-50 rounded print:py-0">
                <li>
                    {sykmelding.arbeidsforEtterPeriode ? (
                        <CheckboxExplanation text="Pasienten er 100% arbeidsfør etter denne perioden" />
                    ) : (
                        <SykmeldingInfoMissing text="Behandler har ikke utfylt om pasienten er arbeidsfør etter denne perioden" />
                    )}
                </li>
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
