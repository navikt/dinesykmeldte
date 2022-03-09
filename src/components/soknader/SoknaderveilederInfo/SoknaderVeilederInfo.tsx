import React from 'react';

import Veileder from '../../shared/veileder/Veileder';

interface Props {
    name: string;
    unsentSoknad: boolean;
}

const SoknaderVeilederInfo = ({ unsentSoknad }: Props): JSX.Element | null => {
    if (unsentSoknad) {
        return (
            <Veileder
                border={false}
                text="Lisa har fått en søknad om sykepenger til utfylling, men har ikke sendt den inn. Du bør minne om at søknaden skal sendes. Unntaket er hvis den allerede er sendt til NAV på papir."
            />
        );
    }

    return null;
};

export default SoknaderVeilederInfo;
