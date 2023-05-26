import React from 'react'

import { Veileder } from '../../shared/veileder/Veileder'

import { MerOmVarslinger } from './MerOmVarslinger'

interface Props {
    name: string
    unsentSoknad: boolean
}

const SoknaderVeilederInfo = ({ name, unsentSoknad }: Props): JSX.Element | null => {
    if (unsentSoknad) {
        return (
            <Veileder
                veilederMerInfo
                text={`${name} har fått en søknad om sykepenger til utfylling, men har ikke sendt den inn. Du bør minne om at søknaden skal sendes. Unntaket er hvis den allerede er sendt til NAV på papir.`}
            >
                <MerOmVarslinger />
            </Veileder>
        )
    }

    return null
}

export default SoknaderVeilederInfo
