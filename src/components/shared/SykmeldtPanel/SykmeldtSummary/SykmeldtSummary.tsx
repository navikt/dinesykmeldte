import React from 'react'
import { ExpansionCard } from '@navikt/ds-react'
import cn from 'classnames'

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated'
import SykmeldtPeriodStatus from '../../SykmeldtPeriodStatus/SykmeldtPeriodStatus'

import SykmeldtIcon from './SykmeldtIcon/SykmeldtIcon'
import styles from './SykmeldtSummary.module.css'

interface Props {
    sykmeldt: PreviewSykmeldtFragment
    notification: boolean
    notSentSoknad: boolean
    notifyingText?: string
}

function SykmeldtSummary({ sykmeldt, notification, notSentSoknad, notifyingText }: Props): JSX.Element {
    return (
        <div className={cn(styles.accordionListItem)}>
            <div className={styles.iconWrapper}>
                <SykmeldtIcon sykmeldt={sykmeldt} notification={notification} notSentSoknad={notSentSoknad} />
            </div>
            <div>
                <ExpansionCard.Title>{sykmeldt.navn}</ExpansionCard.Title>
                <ExpansionCard.Description>
                    {(notification || notSentSoknad) && notifyingText ? (
                        <>{notifyingText}</>
                    ) : (
                        <SykmeldtPeriodStatus sykmeldt={sykmeldt} />
                    )}
                </ExpansionCard.Description>
            </div>
        </div>
    )
}

export default SykmeldtSummary
