import React, { useEffect } from 'react';
import { Cell, Grid, Heading } from '@navikt/ds-react';
import cn from 'classnames';
import { useQuery } from '@apollo/client';

import { MineSykmeldteDocument } from '../../graphql/queries/graphql.generated';
import { partition } from '../../utils/tsUtils';
import { hasNotifications } from '../../utils/sykmeldtUtils';
import ExpandableSykmeldtPanel from '../shared/SykmeldtPanel/ExpandableSykmeldtPanel';
import PageFallbackLoader from '../shared/pagefallbackloader/PageFallbackLoader';
import useWindowFocus from '../../hooks/useWindowFocus';

import useFilteredSykmeldte from './useFilteredSykmeldte';
import PaginatedSykmeldteList from './PaginatedSykmeldteList';
import styles from './SykmeldteList.module.css';
import { useExpanded, useExpandSykmeldte } from './useExpandSykmeldte';

function SykmeldteList(): JSX.Element {
    const focus = useWindowFocus();
    const { loading, data, error, refetch } = useQuery(MineSykmeldteDocument);

    useEffect(() => {
        if (focus) refetch();
    }, [focus, refetch]);

    const handleSykmeldtClick = useExpandSykmeldte();
    const { expandedSykmeldte, expandedSykmeldtPerioder } = useExpanded();
    const filteredMineSykmeldte = useFilteredSykmeldte(data?.mineSykmeldte);

    if (loading && !data) {
        return <PageFallbackLoader text="Laster dine ansatte" />;
    }

    if (error) {
        return <div>Klarte ikke å hente ansatte: {error.message}</div>;
    }

    const [notifying, nonNotifying] = partition(hasNotifications, filteredMineSykmeldte);

    return (
        <>
            {notifying.length > 0 && (
                <section
                    aria-labelledby="sykmeldte-nye-varsler-liste"
                    className={cn({
                        [styles.notifyingSectionHasFollwingSection]: nonNotifying.length > 0,
                    })}
                >
                    <Heading id="sykmeldte-nye-varsler-liste" size="small" level="2" spacing>
                        Nye varsler
                    </Heading>
                    <Grid>
                        {notifying.map((it) => (
                            <Cell key={it.fnr} xs={12}>
                                <ExpandableSykmeldtPanel
                                    sykmeldt={it}
                                    notification
                                    expanded={expandedSykmeldte.includes(it.narmestelederId)}
                                    periodsExpanded={expandedSykmeldtPerioder.includes(it.narmestelederId)}
                                    onClick={handleSykmeldtClick}
                                />
                            </Cell>
                        ))}
                    </Grid>
                </section>
            )}
            {nonNotifying.length > 0 && (
                <section aria-label="Sykmeldte uten varsel">
                    <PaginatedSykmeldteList sykmeldte={nonNotifying} />
                </section>
            )}
        </>
    );
}

export default SykmeldteList;
