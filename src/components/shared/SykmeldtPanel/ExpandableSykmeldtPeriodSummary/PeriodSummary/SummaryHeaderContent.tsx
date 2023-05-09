import { BodyShort, Label } from '@navikt/ds-react'
import { Historic } from '@navikt/ds-icons'

import { formatFirstNamePossessive } from '../../../../../utils/sykmeldtUtils'

interface Props {
    name: string
    expanded: boolean
}

function SummaryHeaderContent({ name, expanded }: Props): JSX.Element {
    return (
        <div className="flex w-full items-center justify-between">
            <Historic className="mr-2 text-xl text-deepblue-400" role="img" aria-hidden />
            <div className="flex flex-[1_0_100px]">
                <Label>{formatFirstNamePossessive(name, 'sykmeldingshistorikk')}</Label>
            </div>
            <BodyShort className="break-keep max-[720px]:hidden" size="small">
                Se {expanded ? 'mindre' : 'mer'}
            </BodyShort>
        </div>
    )
}

export default SummaryHeaderContent
