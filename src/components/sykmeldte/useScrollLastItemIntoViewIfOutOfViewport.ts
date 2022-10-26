import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../state/store'

export function useScrollLastItemIntoViewIfOutOfViewport(
    shouldPaginate: boolean,
): React.MutableRefObject<HTMLDivElement | null> {
    const page = useSelector((state: RootState) => state.pagination.page)
    const lastItemRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const element: HTMLDivElement | null = lastItemRef.current
        if (!shouldPaginate || element == null) return

        const itemBoundingBox = element.getBoundingClientRect()
        if (itemBoundingBox.y < 128) {
            window.scrollTo({ top: window.scrollY + itemBoundingBox.top - 128, behavior: 'smooth' })
        }
    }, [page, shouldPaginate])

    return lastItemRef
}
