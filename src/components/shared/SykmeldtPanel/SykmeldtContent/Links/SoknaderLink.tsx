import { Task, TaskFilled } from '@navikt/ds-icons'
import React from 'react'

import { PreviewSykmeldtFragment } from '../../../../../graphql/queries/graphql.generated'
import LinkPanel from '../../../links/LinkPanel'
import { isPreviewSoknadNotification, getSoknadNotifyDescription } from '../../../../../utils/soknadUtils'

import styles from './SoknaderLink.module.css'

interface Props {
    sykmeldtId: string
    soknader: PreviewSykmeldtFragment['previewSoknader']
}

function SoknaderLink({ sykmeldtId, soknader }: Props): JSX.Element {
    const unreadItems = soknader.filter((it) => isPreviewSoknadNotification(it))
    const notifyDescription = getSoknadNotifyDescription(unreadItems)

    if (unreadItems.length === 0) {
        return (
            <LinkPanel href={`/sykmeldt/${sykmeldtId}/soknader`} Icon={Task}>
                Søknader
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            href={`/sykmeldt/${sykmeldtId}/soknader`}
            Icon={TaskFilled}
            description={
                notifyDescription?.length === 1 ? (
                    notifyDescription
                ) : (
                    <ul className={styles.descriptionList}>
                        {notifyDescription?.map((description: string) => (
                            <li key={description}>{description}</li>
                        ))}
                    </ul>
                )
            }
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
        >
            Søknader
        </LinkPanel>
    )
}

export default SoknaderLink
