import React from 'react'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'
import { PersonPencilIcon } from '@navikt/aksel-icons'

import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { formatDate } from '../../utils/dateUtils'

import styles from './Egenmeldingsdager.module.css'

interface Props {
    egenmeldingsdager?: string[] | null | undefined
}

const title = 'Egenmeldingsdager'

function Egenmeldingsdager({ egenmeldingsdager }: Props): JSX.Element {
    return (
        <>
            <EgenmeldingsdagerList egenmeldingsdager={egenmeldingsdager} />
            <li>
                <Alert className={styles.egenmeldingInfo} variant="info">
                    <Heading size="small" level="3">
                        Opplysninger om egenmeldingsdager
                    </Heading>
                    <BodyShort size="small">
                        Over finner du nå informasjon om den ansatte brukte egenmelding før sykmeldingsperioden.
                    </BodyShort>
                </Alert>
            </li>
        </>
    )
}

function EgenmeldingsdagerList({ egenmeldingsdager }: Props): JSX.Element | null {
    const listItemId = cleanId(title)

    return (
        <li className={styles.egenmeldingsdagerList} aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={PersonPencilIcon} />
            {egenmeldingsdager != null ? (
                <div className={styles.list}>
                    <ul>
                        {egenmeldingsdager?.map((dag: string) => (
                            <BodyShort key={formatDate(dag)} as="li" size="small">
                                {formatDate(dag)}
                            </BodyShort>
                        ))}
                    </ul>
                    <BodyShort size="small">
                        {`(${egenmeldingsdager?.length} ${egenmeldingsdager?.length === 1 ? 'dag' : 'dager'})`}
                    </BodyShort>
                </div>
            ) : (
                <BodyShort className={styles.ingenDager} size="small">
                    Ingen dager valgt.
                </BodyShort>
            )}
        </li>
    )
}

export default Egenmeldingsdager
