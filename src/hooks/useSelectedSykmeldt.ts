import { useQuery } from '@apollo/client'
import { useDispatch, useSelector } from 'react-redux'
import { logger } from '@navikt/next-logger'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import * as R from 'remeda'

import { VirksomheterDocument } from '../graphql/queries/graphql.generated'
import { RootState } from '../state/store'
import filterSlice from '../state/filterSlice'

function useSelectedVirksomhet(): 'all' | string {
    useInitialBedriftQueryParam()

    const virksomhet = useSelector((state: RootState) => state.filter.virksomhet)

    const { data: queryData, loading } = useQuery(VirksomheterDocument)

    if (!loading && !queryData?.virksomheter.some((it) => it.orgnummer === virksomhet)) {
        return 'all'
    }

    if (virksomhet) {
        return virksomhet
    }

    if (!queryData) {
        logger.warn(`User without prefetched virksomheter`)
        return ''
    }

    if (queryData.virksomheter.length === 0) {
        return ''
    }

    return 'all'
}

function useInitialBedriftQueryParam(): void {
    const dispatch = useDispatch()
    const router = useRouter()
    const initialBedrift = (router.query.bedrift as string | undefined) ?? null
    const hasFixedUrlRef = useRef(false)

    useEffect(() => {
        if (hasFixedUrlRef.current || initialBedrift == null) return

        if ('bedrift' in router.query) {
            dispatch(filterSlice.actions.setVirksomhet(initialBedrift))

            const isRootPageWithNoParam = router.pathname === '/[sykmeldtId]' && router.query.sykmeldtId == 'null'
            router.push(
                {
                    pathname: isRootPageWithNoParam ? '/' : router.pathname,
                    query: R.omit({ ...router.query }, isRootPageWithNoParam ? ['sykmeldtId', 'bedrift'] : ['bedrift']),
                },
                undefined,
                { shallow: true },
            )
            hasFixedUrlRef.current = true
        }
    }, [dispatch, initialBedrift, router])
}

export default useSelectedVirksomhet
