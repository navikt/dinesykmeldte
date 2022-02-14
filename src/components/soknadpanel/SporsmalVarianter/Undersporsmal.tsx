import React from 'react';

import { SoknadSporsmalFragment } from '../../../graphql/queries/graphql.generated';

import { SporsmalVarianter } from './SporsmalVarianter';
// eslint-disable-next-line postcss-modules/no-unused-class
import styles from './SporsmalVarianter.module.css';

interface UndersporsmalProps {
    sporsmalsliste: SoknadSporsmalFragment[];
}

function Undersporsmal({ sporsmalsliste }: UndersporsmalProps): JSX.Element | null {
    if (sporsmalsliste.length === 0) return null;

    return (
        <ul className={styles.listItemList}>
            {sporsmalsliste.map((sporsmal: SoknadSporsmalFragment, index: number) => {
                return <SporsmalVarianter key={index} sporsmal={sporsmal} />;
            })}
        </ul>
    );
}

export default Undersporsmal;
