import { SoknadSporsmal } from '../../../shared/schema';

import Checkbox from './Checkbox';
import Undertekst from './Undertekst';
import JaEllerNei from './JaEllerNei';
import Dato from './Dato';
import Fritekst from './Fritekst';
import CheckboxGruppe from './CheckboxGruppe';
import Tall from './Tall';
import Land from './Land';
import RadioGruppe from './RadioGruppe';
import Behandlingsdager from './Behandlingsdager';

export interface SporsmalVarianterProps {
    sporsmal: SoknadSporsmal;
}

export enum PossibleSvarEnum {
    JA = 'JA',
    NEI = 'NEI',
    CHECKED = 'CHECKED',
    UNCHECKED = 'UNCHECKED',
}

export function SporsmalVarianter({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    switch (sporsmal.type) {
        case 'Checkbox':
            return <Checkbox sporsmal={sporsmal} />;
        case 'JaNei':
            return <JaEllerNei sporsmal={sporsmal} />;
        case 'Dato':
            return <Dato sporsmal={sporsmal} />;
        case 'Fritekst':
            return <Fritekst sporsmal={sporsmal} />;
        case 'Land':
            return <Land sporsmal={sporsmal} />;
        case 'Undertekst':
            return <Undertekst sporsmal={sporsmal} />;
        case 'Checkboxgruppe':
            return <CheckboxGruppe sporsmal={sporsmal} />;
        case 'Tall':
            return <Tall sporsmal={sporsmal} />;
        case 'RadioGruppe':
            return <RadioGruppe sporsmal={sporsmal} />;
        case 'Behandlingsdager':
            return <Behandlingsdager sporsmal={sporsmal} />;
    }
}
