import { Grid, Pagination, Select } from '@navikt/ds-react'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { groupBy } from 'remeda'

import { cn } from '../../../utils/tw-utils'
import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated'
import { RootState } from '../../../state/store'
import paginationSlice, { PAGE_SIZE_KEY } from '../../../state/paginationSlice'
import { useScrollLastItemIntoViewIfOutOfViewport } from '../useScrollLastItemIntoViewIfOutOfViewport'

import SykmeldteGrouped from './SykmeldteGrouped'

type Props = {
    sykmeldte: PreviewSykmeldtFragment[]
    focusSykmeldtId: string | null
    showOrgHeading: boolean
}

function PaginatedSykmeldteList({ sykmeldte, focusSykmeldtId, showOrgHeading }: Props): JSX.Element {
    const dispatch = useDispatch()
    const page = useSelector((state: RootState) => state.pagination.page)
    const pageSize = useSelector((state: RootState) => state.pagination.pageSize)
    const shouldPaginate = sykmeldte.length > pageSize
    const list = !shouldPaginate ? sykmeldte : chunkSykmeldte(sykmeldte, page, pageSize)
    const lastItemRef = useScrollLastItemIntoViewIfOutOfViewport(shouldPaginate)
    const focusSykmeldtIndex = sykmeldte.findIndex((it) => it.narmestelederId === focusSykmeldtId)

    const sykmeldteGrouped = Object.entries(groupBy(list, (it) => (showOrgHeading ? it.orgnavn : 'default')))

    useEffect(() => {
        if (!focusSykmeldtId || focusSykmeldtIndex === -1) return

        const focusPage = Math.floor(focusSykmeldtIndex / pageSize)

        requestAnimationFrame(() => {
            dispatch(paginationSlice.actions.setPage(focusPage))
        })
    }, [dispatch, focusSykmeldtId, focusSykmeldtIndex, pageSize])

    return (
        <div>
            <section aria-label={`side ${page + 1} av sykmeldte`} className={cn({ 'min-h-[546px]': shouldPaginate })}>
                <Grid>
                    <SykmeldteGrouped
                        sykmeldteGrouped={sykmeldteGrouped}
                        focusSykmeldtId={focusSykmeldtId}
                        listLength={list.length}
                        lastItemRef={lastItemRef}
                    />
                </Grid>
            </section>
            <PageSizeSelector />
            {shouldPaginate && <PaginationControls sykmeldte={sykmeldte} />}
        </div>
    )
}

function chunkSykmeldte(
    sykmeldte: PreviewSykmeldtFragment[],
    page: number,
    pageSize: number,
): PreviewSykmeldtFragment[] {
    return sykmeldte.slice(pageSize * page, pageSize * page + pageSize)
}

function PaginationControls({ sykmeldte }: { sykmeldte: PreviewSykmeldtFragment[] }): JSX.Element {
    const dispatch = useDispatch()
    const page = useSelector((state: RootState) => state.pagination.page)
    const pageSize = useSelector((state: RootState) => state.pagination.pageSize)
    const pages = Math.ceil(sykmeldte.length / pageSize)

    return (
        <section className="mt-10 flex justify-center" aria-label="navigering for paginering">
            <Pagination
                size="small"
                prevNextTexts
                page={page + 1}
                onPageChange={(pageNumber) => dispatch(paginationSlice.actions.setPage(pageNumber - 1))}
                count={pages}
            />
        </section>
    )
}

function PageSizeSelector(): JSX.Element {
    const dispatch = useDispatch()

    const pageSize = useSelector((state: RootState) => state.pagination.pageSize)

    return (
        <div className="mt-8 flex items-center justify-center">
            <Select
                label="per side"
                size="small"
                className="flex w-28 flex-row-reverse items-center [&>label]:ml-2 [&>label]:flex-auto"
                value={pageSize}
                onChange={(e) => {
                    const value = +e.target.value
                    dispatch(paginationSlice.actions.setPageSize(value))
                    localStorage.setItem(PAGE_SIZE_KEY, `${value}`)
                }}
                autoComplete="off"
            >
                <option>5</option>
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
            </Select>
        </div>
    )
}

export default PaginatedSykmeldteList
