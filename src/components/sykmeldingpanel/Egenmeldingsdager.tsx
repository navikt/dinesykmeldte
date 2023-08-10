import React, { ReactElement } from 'react'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'
import { PersonPencilIcon } from '@navikt/aksel-icons'

import { cleanId } from '../../utils/stringUtils'
import { IconHeading } from '../shared/IconHeading/IconHeading'
import { formatDate } from '../../utils/dateUtils'

interface Props {
    egenmeldingsdager?: string[] | null | undefined
}

const title = 'Egenmeldingsdager'

function Egenmeldingsdager({ egenmeldingsdager }: Props): ReactElement {
    return (
        <>
            <EgenmeldingsdagerList egenmeldingsdager={egenmeldingsdager} />
            <li>
                <Alert className="mb-4 mt-2" variant="info">
                    <Heading size="small" level="3">
                        Opplysninger om egenmeldingsdager
                    </Heading>
                    <BodyShort className="mt-2" size="small">
                        Over finner du nå informasjon om den ansatte brukte egenmelding før sykmeldingsperioden.
                    </BodyShort>
                </Alert>
            </li>
        </>
    )
}

function EgenmeldingsdagerList({ egenmeldingsdager }: Props): ReactElement | null {
    const listItemId = cleanId(title)

    return (
        <li className="pb-4" aria-labelledby={listItemId}>
            <IconHeading title={title} headingId={listItemId} Icon={PersonPencilIcon} />
            {egenmeldingsdager != null ? (
                <div className="rounded bg-blue-50 p-4">
                    <ul className="list-none p-0">
                        {egenmeldingsdager?.map((dag: string) => (
                            <BodyShort key={formatDate(dag)} className="mb-1" as="li" size="small">
                                {formatDate(dag)}
                            </BodyShort>
                        ))}
                    </ul>
                    <BodyShort size="small">
                        {`(${egenmeldingsdager?.length} ${egenmeldingsdager?.length === 1 ? 'dag' : 'dager'})`}
                    </BodyShort>
                </div>
            ) : (
                <BodyShort className="rounded bg-blue-50 p-4" size="small">
                    Ingen dager valgt.
                </BodyShort>
            )}
        </li>
    )
}

export default Egenmeldingsdager
