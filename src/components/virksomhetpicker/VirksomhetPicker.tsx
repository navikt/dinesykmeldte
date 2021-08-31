import React from 'react';
import { Select } from '@navikt/ds-react';

import { useVirksomheterQuery } from '../../graphql/queries/react-query.generated';

import styles from './VirksomhetPicker.module.css';

function VirksomhetPicker(): JSX.Element {
    const { data, isLoading } = useVirksomheterQuery();

    return (
        <div className={styles.root}>
            <Select label="Velg virksomhet" disabled={isLoading}>
                {isLoading && <option value="">Laster virksomheter...</option>}
                {data?.viewer.virksomheter?.map((it) => (
                    <option key={it.orgnummer} value={it.navn}>
                        {it.navn}
                    </option>
                ))}
            </Select>
        </div>
    );
}

export default VirksomhetPicker;
