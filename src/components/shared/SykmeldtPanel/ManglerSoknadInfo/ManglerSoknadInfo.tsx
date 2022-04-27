import React from 'react';
import Link from 'next/link';
import { Alert, Link as DsLink } from '@navikt/ds-react';

import { PreviewSoknadFragment } from '../../../../graphql/queries/graphql.generated';

interface Props {
    soknader: PreviewSoknadFragment[];
    name: string;
    sykmeldtId: string;
}

export function ManglerSoknadInfo({ soknader, name, sykmeldtId }: Props): JSX.Element {
    return (
        <Alert variant="info">
            <Link href={`/sykmeldt/${sykmeldtId}/soknader`} passHref>
                <DsLink>
                    {`Vi mangler ${soknader.length === 1 ? '1 søknad' : soknader.length + ' søknader'} fra ${
                        name.split(' ')[0]
                    }.`}
                </DsLink>
            </Link>
        </Alert>
    );
}
