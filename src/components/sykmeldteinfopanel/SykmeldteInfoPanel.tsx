import React from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@apollo/client';

import Veileder from '../shared/veileder/Veileder';
import { MineSykmeldteDocument } from '../../graphql/queries/graphql.generated';

import { noRegisteredSykmeldte, registeredSykmeldte } from './infoText';

const DismissableVeileder = dynamic(() => import('../shared/veileder/DismissableVeileder'), {
    ssr: false,
});

function SykmeldteInfoPanel(): JSX.Element | null {
    const { data, loading } = useQuery(MineSykmeldteDocument);

    if (loading || !data) return null;

    if (!data?.mineSykmeldte?.length) {
        return <Veileder text={noRegisteredSykmeldte} />;
    }

    return <DismissableVeileder storageKey="personalansvar-info" text={registeredSykmeldte} />;
}

export default SykmeldteInfoPanel;
