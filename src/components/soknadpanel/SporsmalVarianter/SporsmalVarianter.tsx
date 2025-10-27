import { logger } from '@navikt/next-logger'
import { ReactElement } from 'react'

import { SoknadSporsmalFragment, SoknadSporsmalSvartypeEnum } from '../../../graphql/queries/graphql.generated'

import Checkbox from './Checkbox'
import Undertekst from './Undertekst'
import JaEllerNei from './JaEllerNei'
import Dato from './Dato'
import Fritekst from './Fritekst'
import CheckboxGruppe from './CheckboxGruppe'
import Tall from './Tall'
import Land from './Land'
import RadioGruppe from './RadioGruppe'
import Behandlingsdager from './Behandlingsdager'
import Periode from './Periode'
import Kvittering from './Kvittering'

export interface SporsmalVarianterProps {
    sporsmal: SoknadSporsmalFragment
}

export enum PossibleSvarEnum {
    JA = 'JA',
    NEI = 'NEI',
    CHECKED = 'CHECKED',
    UNCHECKED = 'UNCHECKED',
}

export function SporsmalVarianter({ sporsmal }: SporsmalVarianterProps): ReactElement | null {
    switch (sporsmal.svartype) {
        case SoknadSporsmalSvartypeEnum.CheckboxPanel:
        case SoknadSporsmalSvartypeEnum.Checkbox:
            return <Checkbox sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.JaNei:
            return <JaEllerNei sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.Dato:
        case SoknadSporsmalSvartypeEnum.Datoer:
        case SoknadSporsmalSvartypeEnum.AarMaaned:
            return <Dato sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.Fritekst:
            return <Fritekst sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.Land:
            return <Land sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.IkkeRelevant:
            return <Undertekst sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.CheckboxGruppe:
            return <CheckboxGruppe sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.Tall:
        case SoknadSporsmalSvartypeEnum.Prosent:
        case SoknadSporsmalSvartypeEnum.Timer:
        case SoknadSporsmalSvartypeEnum.Belop:
        case SoknadSporsmalSvartypeEnum.Kilometer:
            return <Tall sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.RadioGruppe:
        case SoknadSporsmalSvartypeEnum.RadioGruppeTimerProsent:
            return <RadioGruppe sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.InfoBehandlingsdager:
            return <Behandlingsdager sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.Periode:
        case SoknadSporsmalSvartypeEnum.Perioder:
            return <Periode sporsmal={sporsmal} />

        case SoknadSporsmalSvartypeEnum.Kvittering:
            return <Kvittering sporsmal={sporsmal} />

        default:
            logger.error(`Mangler implementasjon for sporsmal av type "${sporsmal.svartype}". Er det noe vi har glemt?`)
            return null
    }
}
