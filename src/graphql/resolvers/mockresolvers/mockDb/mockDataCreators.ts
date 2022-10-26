import { FomTom, PeriodeEnum } from '../../resolvers.generated'
import { dateAdd, toDate, toDateString } from '../../../../utils/dateUtils'
import {
    AktivitetIkkeMuligApi,
    AvventendeApi,
    BehandlingsdagerApi,
    GradertApi,
    ReisetilskuddApi,
} from '../../../../services/minesykmeldte/schema/sykmelding'

export function createAktivitetIkkeMulig(
    fom: Date | string,
    days: number,
    arbeidsrelatertArsak: AktivitetIkkeMuligApi['arbeidsrelatertArsak'] | null = null,
): AktivitetIkkeMuligApi {
    return {
        type: PeriodeEnum.AktivitetIkkeMulig,
        ...createFomTom(fom, days),
        arbeidsrelatertArsak,
    }
}

export function createGradert(fom: Date | string, days: number, grad = 50, reisetilskudd = false): GradertApi {
    return {
        type: PeriodeEnum.Gradert,
        ...createFomTom(fom, days),
        grad,
        reisetilskudd,
    }
}

export function createAvventende(fom: Date | string, days: number, tilrettelegging: string): AvventendeApi {
    return {
        type: PeriodeEnum.Avventende,
        ...createFomTom(fom, days),
        tilrettelegging,
    }
}

export function createBehandlingsdager(fom: Date | string, days: number, behandlingsdager = 1): BehandlingsdagerApi {
    return {
        type: PeriodeEnum.Behandlingsdager,
        ...createFomTom(fom, days),
        behandlingsdager,
    }
}

export function createReisetilskudd(fom: Date | string, days: number): ReisetilskuddApi {
    return {
        type: PeriodeEnum.Reisetilskudd,
        ...createFomTom(fom, days),
    }
}

function createFomTom(fom: Date | string, days: number): FomTom {
    const fomDate = toDate(fom)
    return {
        fom: toDateString(fomDate),
        tom: dateAdd(fomDate, { days }),
    }
}
