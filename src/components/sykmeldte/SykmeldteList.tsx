import React, { useEffect } from 'react';
import { Grid, Heading } from '@navikt/ds-react';
import cn from 'classnames';
import { useQuery } from '@apollo/client';
import { batch, useDispatch, useSelector } from 'react-redux';
import { groupBy } from 'remeda';

import { MineSykmeldteDocument } from '../../graphql/queries/graphql.generated';
import { partition } from '../../utils/tsUtils';
import { notificationCount } from '../../utils/sykmeldtUtils';
import PageFallbackLoader from '../shared/pagefallbackloader/PageFallbackLoader';
import ErrorBoundary from '../shared/errors/ErrorBoundary';
import PageError from '../shared/errors/PageError';
import useParam, { RouteLocation } from '../../hooks/useParam';
import expandedSlice from '../../state/expandedSlice';
import filterSlice from '../../state/filterSlice';
import useFocusRefetch from '../../hooks/useFocusRefetch';
import { previewNySoknaderRead } from '../../utils/soknadUtils';
import { RootState } from '../../state/store';

import useFilteredSykmeldte from './useFilteredSykmeldte';
import Sykmeldte from './Sykmeldte';
import PaginatedSykmeldteList from './PaginatedSykmeldteList';
import styles from './SykmeldteList.module.css';

function SykmeldteList(): JSX.Element {
    const { loading, data, error, refetch } = useQuery(MineSykmeldteDocument);
    const { sykmeldtId: focusSykmeldtId } = useParam(RouteLocation.Root);
    const dispatch = useDispatch();

    const filter = useSelector((state: RootState) => state.filter);
    const showOrgHeading = filter.show === 'sykmeldte-per-virksomhet';

    useFocusRefetch(refetch);

    useEffect(() => {
        if (!focusSykmeldtId) return;

        batch(() => {
            dispatch(filterSlice.actions.setName(''));
            dispatch(filterSlice.actions.setShow('all'));
            dispatch(expandedSlice.actions.setExpandSykmeldt(focusSykmeldtId));
        });
    }, [dispatch, focusSykmeldtId]);

    const filteredMineSykmeldte = useFilteredSykmeldte(data?.mineSykmeldte);

    if (loading && !data) {
        return <PageFallbackLoader text="Laster dine ansatte" />;
    }

    if (error) {
        return <PageError text="Klarte ikke å hente dine sykmeldte" />;
    }

    const [notifyingAndNotSendtSoknader, nonNotifying] = partition(
        (it) =>
            notificationCount(it) > 0 ||
            (notificationCount(it) === 0 && previewNySoknaderRead(it.previewSoknader).length > 0),
        filteredMineSykmeldte,
    );
    const [notSendtSoknader, notifying] = partition(
        (it) => previewNySoknaderRead(it.previewSoknader).length > 0 && notificationCount(it) === 0,
        notifyingAndNotSendtSoknader,
    );

    const notSendtSoknaderGrouped = Object.entries(
        groupBy(notSendtSoknader, (it) => (showOrgHeading ? it.orgnavn : 'default')),
    );
    const notifyingGrouped = Object.entries(groupBy(notifying, (it) => (showOrgHeading ? it.orgnavn : 'default')));

    return (
        <ErrorBoundary>
            {notifyingAndNotSendtSoknader.length > 0 && (
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
                        <Sykmeldte sykmeldteGrouped={notifyingGrouped} focusSykmeldtId={focusSykmeldtId} notification />
                        <Sykmeldte sykmeldteGrouped={notSendtSoknaderGrouped} focusSykmeldtId={focusSykmeldtId} />
                    </Grid>
                </section>
            )}
            {nonNotifying.length > 0 && (
                <section aria-label="Sykmeldte uten varsel">
                    <PaginatedSykmeldteList
                        sykmeldte={nonNotifying}
                        focusSykmeldtId={focusSykmeldtId}
                        showOrgHeading={showOrgHeading}
                    />
                </section>
            )}
        </ErrorBoundary>
    );
}

export default SykmeldteList;
