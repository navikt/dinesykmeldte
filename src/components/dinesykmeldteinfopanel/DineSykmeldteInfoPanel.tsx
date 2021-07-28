import React from 'react';

import { useDineSykmeldteQuery } from '../../graphql/queries/react-query.generated';
import { DismissableVeileder, Veileder } from '../shared/veileder/Veileder';

import { noRegisteredSykmeldte, registeredSykmeldte } from './infoText';

function DineSykmeldteInfoPanel(): JSX.Element | null {
    const { data, isLoading } = useDineSykmeldteQuery();

    if (isLoading || !data) return null;

    if (data.dineSykmeldte.length === 0) {
        return <Veileder text={noRegisteredSykmeldte} />;
    }

    return <DismissableVeileder storageKey="personalansvar-info" text={registeredSykmeldte} />;
}

export default DineSykmeldteInfoPanel;
