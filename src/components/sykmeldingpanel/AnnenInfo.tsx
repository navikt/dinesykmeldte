import React, { ReactElement } from 'react'
import { InformationSquareIcon } from '@navikt/aksel-icons'

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

function AnnenInfo({ sykmelding }: Props): ReactElement {
    const listItemId = cleanId(title)

    return (
        <li aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={InformationSquareIcon} />
            <ul className="list-none pb-4">
                <ListItem
                    title="Dato sykmeldingen ble skrevet"
                    text={formatDate(sykmelding.behandletTidspunkt)}
                    headingLevel="4"
                    bgListItem
                />

                {!isUtenlandsk(sykmelding) ? (
                    <>
                        <ListItem
                            title="Sykmeldingen ble skrevet av"
                            text={[
                                sykmelding.behandler?.navn ?? 'Ukjent behandler',
                                sykmelding.behandler?.telefon
                                    ? `Tlf: ${sykmelding.behandler.telefon}`
                                    : 'Telefonnummer mangler',
                            ]}
                            headingLevel="4"
                            bgListItem
                        />
                        <ListItem
                            title="Arbeidsgiver som er oppgitt i sykmeldingen"
                            text={sykmelding.arbeidsgiver.navn ?? 'Ukjent arbeidsgiver'}
                            headingLevel="4"
                            bgListItem
                        />
                    </>
                ) : (
                    <ListItem
                        title="Landet sykmeldingen ble skrevet"
                        text={sykmelding.utenlandskSykmelding.land}
                        headingLevel="4"
                        bgListItem
                    />
                )}
            </ul>
        </li>
    )
}

export default AnnenInfo
