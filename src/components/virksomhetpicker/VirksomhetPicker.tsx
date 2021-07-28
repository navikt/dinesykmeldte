import React from 'react';
import { Title } from '@navikt/ds-react';
import { Select } from 'nav-frontend-skjema';

import { useVirksomheterQuery } from '../../graphql/queries/react-query.generated';

import styles from './VirksomhetPicker.module.css';

function VirksomhetPicker(): JSX.Element {
    const { data, isLoading } = useVirksomheterQuery();

    return (
        <div className={styles.root}>
            <Title size="l" level={2} className={styles.pickerHeader}>
                Velg virksomhet
            </Title>
            <Select bredde="xl" disabled={isLoading}>
                {isLoading && <option value="">Laster virksomheter...</option>}
                {data?.viewer.virksomheter.map((it) => (
                    <option key={it.uuid} value={it.uuid}>
                        {it.navn}
                    </option>
                ))}
            </Select>
        </div>
    );
}

export default VirksomhetPicker;
