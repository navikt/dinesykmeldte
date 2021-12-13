import React, { useEffect } from 'react';
import { Select } from '@navikt/ds-react';

import { useVirksomheterQuery } from '../../graphql/queries/react-query.generated';
import { logger } from '../../utils/logger';

import styles from './VirksomhetPicker.module.css';

function VirksomhetPicker(): JSX.Element {
    const { data, isLoading } = useVirksomheterQuery();

    useEffect(() => {
        logger.info(`I'm logging from VirksomhetPicker on the client, ${data?.virksomheter.length}`);
    }, [data]);

    return (
        <div className={styles.root}>
            <Select label="Velg virksomhet" disabled={isLoading}>
                {isLoading && <option value="">Laster virksomheter...</option>}
                {data?.virksomheter.map((it) => (
                    <option key={it.orgnummer} value={it.navn}>
                        {it.navn}
                    </option>
                ))}
            </Select>
        </div>
    );
}

export default VirksomhetPicker;
