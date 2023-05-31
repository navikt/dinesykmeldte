import React from 'react'
import { Information } from '@navikt/ds-icons'

import { IconHeading } from '../shared/IconHeading/IconHeading'
import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { formatDate } from '../../utils/dateUtils'
import { cleanId } from '../../utils/stringUtils'
import { isUtenlandsk } from '../../utils/utenlanskUtils'
import { ListItem } from '../shared/listItem/ListItem'

interface Props {
    sykmelding: SykmeldingFragment
}

const title = 'Annen info'

function AnnenInfoShort({ sykmelding }: Props): JSX.Element {
    const listItemId = cleanId(title)

    return (
        <li aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={Information} />
            <ul className="list-none pb-4">
                <ListItem
                    title="Dato sykmeldingen ble skrevet"
                    text={formatDate(sykmelding.behandletTidspunkt)}
                    headingLevel="4"
                    blueListItem
                />

                {!isUtenlandsk(sykmelding) ? (
                    <ListItem
                        title="Arbeidsgiver som er oppgitt i sykmeldingen"
                        text={sykmelding.arbeidsgiver.navn ?? 'Ukjent'}
                        headingLevel="4"
                        blueListItem
                    />
                ) : (
                    <ListItem
                        title="Landet sykmeldingen ble skrevet"
                        text={sykmelding.utenlandskSykmelding.land}
                        headingLevel="4"
                        blueListItem
                    />
                )}
            </ul>
        </li>
    )
}

export default AnnenInfoShort
