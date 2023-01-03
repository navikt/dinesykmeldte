import React, { useCallback } from 'react'
import { HelpText, Select } from '@navikt/ds-react'
import cn from 'classnames'
import { useQuery } from '@apollo/client'
import { useDispatch } from 'react-redux'

import { VirksomheterDocument } from '../../graphql/queries/graphql.generated'
import useSelectedVirksomhet from '../../hooks/useSelectedSykmeldt'
import filterSlice from '../../state/filterSlice'

import styles from './VirksomhetPicker.module.css'

interface Props {
    className?: string
}

function VirksomhetPicker({ className }: Props): JSX.Element {
    const dispatch = useDispatch()
    const virksomhet = useSelectedVirksomhet()
    const { data, loading } = useQuery(VirksomheterDocument, { returnPartialData: true })
    const virksomhetCount = data?.virksomheter.length ?? 0

    const handleVirksomhetChange = useCallback(
        (virksomhetId: string) => {
            dispatch(filterSlice.actions.setVirksomhet(virksomhetId))
        },
        [dispatch],
    )

    return (
        <div className={cn(styles.root, className)}>
            <Select
                className={styles.select}
                label="Velg virksomhet"
                disabled={loading || virksomhetCount === 0}
                value={virksomhet}
                onChange={(event) => handleVirksomhetChange(event.target.value)}
                autoComplete="off"
            >
                {loading && <option value="">Laster virksomheter...</option>}
                {!loading && virksomhetCount === 0 && <option>Ingen virksomheter</option>}
                {!loading && virksomhetCount > 0 && <option value="all">Alle virksomheter</option>}
                {data?.virksomheter &&
                    data.virksomheter.map((it) => (
                        <option key={it.orgnummer} value={it.orgnummer}>
                            {it.navn}
                        </option>
                    ))}
            </Select>
            <HelpText className={styles.helpText} title="vis hjelpetekst angående virksomheter">
                Virksomheten der du er meldt inn som nærmeste leder er synlig i listen inntil 4 måneder etter at
                medarbeiderene er friskmeldte.
            </HelpText>
        </div>
    )
}

export default VirksomhetPicker
