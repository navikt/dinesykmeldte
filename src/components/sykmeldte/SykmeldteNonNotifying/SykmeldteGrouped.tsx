import React, { ReactElement, Ref } from 'react'

import { PreviewSykmeldtFragment } from '../../../graphql/queries/graphql.generated'
import ExpandableSykmeldtPanel from '../../shared/SykmeldtPanel/ExpandableSykmeldtPanel'
import { useExpanded, useExpandSykmeldte } from '../useExpandSykmeldte'

import OrgHeading from './OrgHeading'

interface Props {
    sykmeldteGrouped: ['default' | string, PreviewSykmeldtFragment[]][]
    focusSykmeldtId: string | null
    notification?: boolean
    listLength?: number | undefined
    lastItemRef?: Ref<HTMLDivElement> | undefined
}

function SykmeldteGrouped({
    sykmeldteGrouped,
    focusSykmeldtId,
    notification = false,
    listLength,
    lastItemRef,
}: Props): ReactElement {
    const { expandedSykmeldte, expandedSykmeldtPerioder } = useExpanded()
    const handleSykmeldtClick = useExpandSykmeldte(focusSykmeldtId, expandedSykmeldte)

    return (
        <>
            {sykmeldteGrouped.map(([group, items], groupIndex) =>
                items.map((it, index) => (
                    <div
                        ref={
                            groupIndex === sykmeldteGrouped.length - 1 && index === listLength && listLength - 1
                                ? lastItemRef
                                : undefined
                        }
                        key={it.narmestelederId}
                    >
                        {group !== 'default' && index === 0 && <OrgHeading orgname={group} />}
                        <ExpandableSykmeldtPanel
                            sykmeldt={it}
                            notification={notification}
                            expanded={expandedSykmeldte.includes(it.narmestelederId)}
                            periodsExpanded={expandedSykmeldtPerioder.includes(it.narmestelederId)}
                            onClick={handleSykmeldtClick}
                            focusSykmeldtId={focusSykmeldtId}
                            isHeadingLevel4={group !== 'default' && index === 0}
                        />
                    </div>
                )),
            )}
        </>
    )
}

export default SykmeldteGrouped
