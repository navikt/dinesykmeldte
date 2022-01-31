import React, { useCallback } from 'react';
import { Select } from '@navikt/ds-react';

import { useVirksomheterQuery } from '../../graphql/queries/react-query.generated';
import { useApplicationContext } from '../shared/StateProvider';
import useSelectedVirksomhet from '../../hooks/useSelectedSykmeldt';

import styles from './VirksomhetPicker.module.css';

function VirksomhetPicker(): JSX.Element {
    const [, dispatch] = useApplicationContext();
    const virksomhet = useSelectedVirksomhet();
    const { data, isLoading } = useVirksomheterQuery();
    const virksomhetCount = data?.virksomheter.length ?? 0;

    const handleVirksomhetChange = useCallback(
        (virksomhetId: string) => {
            dispatch({ type: 'setVirksomhet', payload: virksomhetId });
        },
        [dispatch],
    );

    return (
        <div className={styles.root}>
            <Select
                className={styles.select}
                label="Velg virksomhet"
                disabled={isLoading || virksomhetCount === 0}
                value={virksomhet}
                onChange={(event) => handleVirksomhetChange(event.target.value)}
            >
                {isLoading && <option value="">Laster virksomheter...</option>}
                {!isLoading && virksomhetCount === 0 && <option>Ingen virksomheter tilgjengelig</option>}
                {data?.virksomheter &&
                    data.virksomheter.map((it) => (
                        <option key={it.orgnummer} value={it.orgnummer}>
                            {it.navn}
                        </option>
                    ))}
            </Select>
        </div>
    );
}

export default VirksomhetPicker;
