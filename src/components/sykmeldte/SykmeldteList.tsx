import { useEffect } from 'react'
import { ApolloError, useQuery } from '@apollo/client'
import { batch, useDispatch } from 'react-redux'
import { partition } from 'remeda'

import { MineSykmeldteDocument } from '../../graphql/queries/graphql.generated'
import { notificationCount } from '../../utils/sykmeldtUtils'
import PageFallbackLoader from '../shared/pagefallbackloader/PageFallbackLoader'
import ErrorBoundary from '../shared/errors/ErrorBoundary'
import PageError from '../shared/errors/PageError'
import useParam, { RouteLocation } from '../../hooks/useParam'
import expandedSlice from '../../state/expandedSlice'
import filterSlice from '../../state/filterSlice'
import useFocusRefetch from '../../hooks/useFocusRefetch'
import VirksomhetPicker from '../virksomhetpicker/VirksomhetPicker'

import SykmeldteNonNotifying from './SykmeldteNonNotifying/SykmeldteNonNotifying'
import SykmeldteNotifying from './SykmeldteNotifying/SykmeldteNotifying'

function SykmeldteList(): JSX.Element {
    const { loading, data, error, refetch } = useQuery(MineSykmeldteDocument)
    const { sykmeldtId: focusSykmeldtId } = useParam(RouteLocation.Root)
    const dispatch = useDispatch()

    useFocusRefetch(refetch)

    useEffect(() => {
        if (!focusSykmeldtId) return

        batch(() => {
            dispatch(filterSlice.actions.setName(''))
            dispatch(filterSlice.actions.setShow('all'))
            dispatch(expandedSlice.actions.setExpandSykmeldt(focusSykmeldtId))
        })
    }, [dispatch, focusSykmeldtId])

    if (loading && !data) {
        return <PageFallbackLoader text="Laster dine ansatte" />
    }

    // If the user has been logged out, the redux state will cause a modal to be shown, so leave the existing state
    // Initial rendiering will never be 401, since it has been SSR-ed
    if (error && !isUserLoggedOutError(error)) {
        return <PageError text="Klarte ikke å hente dine sykmeldte" cause={error.message} />
    }

    const [notifyingAndNotSendtSoknader, nonNotifying] = partition(
        data?.mineSykmeldte ?? [],
        (it) => notificationCount(it) > 0,
    )

    return (
        // @ts-expect-error Weird TS5.0 + Next 13.4 typing error
        <ErrorBoundary>
            <div className="hidden max-[720px]:mb-4 max-[720px]:mt-12 max-[720px]:block">
                <VirksomhetPicker />
            </div>
            <SykmeldteNotifying
                sykmeldte={notifyingAndNotSendtSoknader}
                focusSykmeldtId={focusSykmeldtId}
                nonNotifyingCount={nonNotifying.length}
            />
            <SykmeldteNonNotifying sykmeldte={nonNotifying} focusSykmeldtId={focusSykmeldtId} />
        </ErrorBoundary>
    )
}

function isUserLoggedOutError({ networkError }: ApolloError): boolean {
    if (!networkError) return false

    if ('statusCode' in networkError) {
        return networkError.statusCode === 401
    }

    return false
}

export default SykmeldteList
