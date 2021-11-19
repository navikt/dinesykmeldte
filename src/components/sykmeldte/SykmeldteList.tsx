import React from 'react';
import { Cell, Grid, Loader } from '@navikt/ds-react';

import { useMineSykmeldteQuery } from '../../graphql/queries/react-query.generated';

import ExpandableSykmeldt from './expandablesykmeldt/ExpandableSykmeldt';

function SykmeldteList(): JSX.Element {
    const { isLoading, data, error } = useMineSykmeldteQuery();

    if (isLoading) {
        return <Loader aria-label="Laster dine ansatte" title="Laster dine ansatte" size="2xlarge" />;
    }

    if (error) {
        return <div>Klarte ikke å hente ansatte: {error.message}</div>;
    }

    return (
        <Grid>
            {data?.mineSykmeldte?.map((it) => (
                <Cell key={it.fnr} xs={12}>
                    <ExpandableSykmeldt sykmeldt={it} />
                </Cell>
            ))}
        </Grid>
    );
}

export default SykmeldteList;
