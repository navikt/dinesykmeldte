import React, { useCallback } from 'react';
import { HelpText, Select } from '@navikt/ds-react';
import cn from 'classnames';
import { useQuery } from '@apollo/client';

import { VirksomheterDocument } from '../../graphql/queries/graphql.generated';
import { useApplicationContext } from '../shared/StateProvider';
import useSelectedVirksomhet from '../../hooks/useSelectedSykmeldt';

import styles from './VirksomhetPicker.module.css';

interface Props {
    className?: string;
}

function VirksomhetPicker({ className }: Props): JSX.Element {
    const [, dispatch] = useApplicationContext();
    const virksomhet = useSelectedVirksomhet();
    const { data, loading } = useQuery(VirksomheterDocument, { returnPartialData: true });
    const virksomhetCount = data?.virksomheter.length ?? 0;

    const handleVirksomhetChange = useCallback(
        (virksomhetId: string) => {
            dispatch({ type: 'setVirksomhet', payload: virksomhetId });
        },
        [dispatch],
    );

    return (
        <div className={cn(styles.root, className)}>
            <Select
                className={styles.select}
                label="Velg virksomhet"
                disabled={loading || virksomhetCount === 0}
                value={virksomhet}
                onChange={(event) => handleVirksomhetChange(event.target.value)}
            >
                {loading && <option value="">Laster virksomheter...</option>}
                {!loading && virksomhetCount === 0 && <option>Ingen virksomheter</option>}
                {data?.virksomheter &&
                    data.virksomheter.map((it) => (
                        <option key={it.orgnummer} value={it.orgnummer}>
                            {it.navn}
                        </option>
                    ))}
            </Select>
            <HelpText className={styles.helpText} title="vis hjelpetekst angående virksomheter">
                <div className={styles.helpTextContent}>
                    Av personvernhensyn er virksomheten synlig i listen inntil fire måneder etter at medarbeiderene er
                    friskmeldte.
                </div>
            </HelpText>
        </div>
    );
}

export default VirksomhetPicker;
