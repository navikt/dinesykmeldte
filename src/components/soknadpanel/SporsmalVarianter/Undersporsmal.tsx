import React from 'react';

import { SoknadSporsmal } from '../../../shared/schema';

import { SporsmalVarianter } from './SporsmalVarianter';
import SporsmalList from './shared/SporsmalList';

interface UndersporsmalProps {
    sporsmalsliste: SoknadSporsmal[];
}

function Undersporsmal({ sporsmalsliste }: UndersporsmalProps): JSX.Element | null {
    if (sporsmalsliste.length === 0) return null;

    return (
        <SporsmalList>
            {sporsmalsliste.map((sporsmal) => (
                <SporsmalVarianter key={sporsmal.id} sporsmal={sporsmal} />
            ))}
        </SporsmalList>
    );
}

export default Undersporsmal;
