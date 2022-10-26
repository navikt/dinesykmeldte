import React from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'
import cn from 'classnames'

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated'
import SykmeldtPeriodStatus from '../../SykmeldtPeriodStatus/SykmeldtPeriodStatus'

import SykmeldtIcon from './SykmeldtIcon/SykmeldtIcon'
import styles from './SykmeldtSummary.module.css'

interface Props {
    sykmeldt: PreviewSykmeldtFragment
    notification: boolean
    notSentSoknad: boolean
}

function SykmeldtSummary({ sykmeldt, notification, notSentSoknad }: Props): JSX.Element {
    return (
        <div className={cn(styles.accordionListItem)}>
            <SykmeldtIcon sykmeldt={sykmeldt} notification={notification} notSentSoknad={notSentSoknad} />
            <div>
                <Heading size="medium" level="3">
                    {sykmeldt.navn}
                </Heading>
                <BodyShort>
                    <SykmeldtPeriodStatus sykmeldt={sykmeldt} />
                </BodyShort>
            </div>
        </div>
    )
}

export default SykmeldtSummary
