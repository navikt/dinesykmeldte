import React, { useCallback } from 'react';
import { Cell, Grid, Loader } from '@navikt/ds-react';

import { useMineSykmeldteQuery } from '../../graphql/queries/react-query.generated';
import { useApplicationContext } from '../shared/StateProvider';

import ExpandableSykmeldt from './expandablesykmeldt/ExpandableSykmeldt';
import useFilteredSykmeldte from './useFilteredSykmeldte';

function SykmeldteList(): JSX.Element {
    const { isLoading, data, error } = useMineSykmeldteQuery();
    const filteredMineSykmeldte = useFilteredSykmeldte(data?.mineSykmeldte);
    const [state, dispatch] = useApplicationContext();
    const handleSykmeldtClick = useCallback(
        (id: string) => {
            dispatch({ type: 'toggleExpandSykmeldte', payload: id });
        },
        [dispatch],
    );

    if (isLoading) {
        return <Loader aria-label="Laster dine ansatte" title="Laster dine ansatte" size="2xlarge" />;
    }

    if (error) {
        return <div>Klarte ikke å hente ansatte: {error.message}</div>;
    }

    return (
        <Grid>
            {filteredMineSykmeldte.map((it) => (
                <Cell key={it.fnr} xs={12}>
                    <ExpandableSykmeldt
                        sykmeldt={it}
                        expanded={state.expandedSykmeldte.includes(it.narmestelederId)}
                        onClick={handleSykmeldtClick}
                    />
                </Cell>
            ))}
        </Grid>
    );
}

export default SykmeldteList;
