import { Back, Next } from '@navikt/ds-icons';
import { Button, Cell, Grid } from '@navikt/ds-react';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';
import ExpandableSykmeldtPanel from '../shared/SykmeldtPanel/ExpandableSykmeldtPanel';
import { RootState } from '../../state/store';
import paginationSlice from '../../state/paginationSlice';

import styles from './PaginatedSykmeldteList.module.css';
import { useExpanded, useExpandSykmeldte } from './useExpandSykmeldte';

type Props = {
    sykmeldte: PreviewSykmeldtFragment[];
};

const PAGE_SIZE = 5;

function PaginatedSykmeldteList({ sykmeldte }: Props): JSX.Element {
    const handleSykmeldtClick = useExpandSykmeldte();
    const { expandedSykmeldte, expandedSykmeldtPerioder } = useExpanded();
    const shouldPaginate = sykmeldte.length > PAGE_SIZE;
    const page = useSelector((state: RootState) => state.pagination.page);
    const list = !shouldPaginate ? sykmeldte : chunkSykmeldte(sykmeldte, page);
    const lastItemRef = useScrollLastItemIntoViewIfOutOfViewport(shouldPaginate);

    return (
        <div>
            <section aria-label={`side ${page + 1} av sykmeldte`} className={styles.paginatedSection}>
                <Grid>
                    {list.map((it, index) => (
                        <Cell
                            ref={index === list.length - 1 ? lastItemRef : undefined}
                            key={it.narmestelederId}
                            xs={12}
                        >
                            <ExpandableSykmeldtPanel
                                sykmeldt={it}
                                notification={false}
                                expanded={expandedSykmeldte.includes(it.narmestelederId)}
                                periodsExpanded={expandedSykmeldtPerioder.includes(it.narmestelederId)}
                                onClick={handleSykmeldtClick}
                            />
                        </Cell>
                    ))}
                </Grid>
            </section>
            {shouldPaginate && <PaginationControls sykmeldte={sykmeldte} />}
        </div>
    );
}

function chunkSykmeldte(sykmeldte: PreviewSykmeldtFragment[], page: number): PreviewSykmeldtFragment[] {
    return sykmeldte.slice(PAGE_SIZE * page, PAGE_SIZE * page + PAGE_SIZE);
}

function useScrollLastItemIntoViewIfOutOfViewport(
    shouldPaginate: boolean,
): React.MutableRefObject<HTMLDivElement | null> {
    const page = useSelector((state: RootState) => state.pagination.page);
    const lastItemRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const element: HTMLDivElement | null = lastItemRef.current;
        if (!shouldPaginate || element == null) return;

        const itemBoundingBox = element.getBoundingClientRect();
        if (itemBoundingBox.y < 128) {
            window.scrollTo({ top: window.scrollY + itemBoundingBox.top - 128, behavior: 'smooth' });
        }
    }, [page, shouldPaginate]);

    return lastItemRef;
}

function PaginationControls({ sykmeldte }: { sykmeldte: PreviewSykmeldtFragment[] }): JSX.Element {
    const dispatch = useDispatch();
    const page = useSelector((state: RootState) => state.pagination.page);
    const pages = Math.ceil(sykmeldte.length / PAGE_SIZE);

    return (
        <section className={styles.paginationControls} aria-label="navigering for paginering">
            <Button
                className={styles.paginationButton}
                size="small"
                variant="tertiary"
                disabled={page === 0}
                onClick={() => dispatch(paginationSlice.actions.previous())}
            >
                <Back /> Forrige
            </Button>
            <div className={styles.paginationPages}>
                {Array.from(new Array(pages).keys()).map((pageNumber) => (
                    <Button
                        className={cn({ [styles.pageButtonSelected]: page === pageNumber })}
                        aria-selected={page === pageNumber}
                        key={pageNumber}
                        size="small"
                        variant="tertiary"
                        onClick={() => dispatch(paginationSlice.actions.setPage(pageNumber))}
                    >
                        {pageNumber + 1}
                    </Button>
                ))}
            </div>
            <Button
                className={styles.paginationButton}
                size="small"
                variant="tertiary"
                disabled={page === pages - 1}
                onClick={() => dispatch(paginationSlice.actions.next())}
            >
                Neste <Next />
            </Button>
        </section>
    );
}

export default PaginatedSykmeldteList;
