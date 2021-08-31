import React from 'react';
import dynamic from 'next/dynamic';

import Veileder from '../shared/veileder/Veileder';
import { useSykmeldingerQuery } from '../../graphql/queries/react-query.generated';

import { noRegisteredSykmeldte, registeredSykmeldte } from './infoText';

const DismissableVeileder = dynamic(() => import('../shared/veileder/DismissableVeileder'), {
    ssr: false,
});

function DineSykmeldteInfoPanel(): JSX.Element | null {
    const { data, isLoading } = useSykmeldingerQuery({ selectedOrg: 'ayy' });

    if (isLoading || !data) return null;

    if (!data.virksomhet?.sykmeldte?.length) {
        return <Veileder text={noRegisteredSykmeldte} />;
    }

    return <DismissableVeileder storageKey="personalansvar-info" text={registeredSykmeldte} />;
}

export default DineSykmeldteInfoPanel;
