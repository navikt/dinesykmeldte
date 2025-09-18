import React, { ReactElement, useEffect, useState } from 'react'
import { TasklistIcon, TasklistFillIcon } from '@navikt/aksel-icons'

import LinkPanel from '../../../links/LinkPanel'
import { OppfolgingsplanFragment } from '../../../../../graphql/queries/graphql.generated'
import { isPilotUser } from '../../../../../utils/tsUtils'

import LinkMessageList from './LinkMessageList'

interface Props {
    sykmeldtId: string
    oppfolgingsplaner: OppfolgingsplanFragment[]
}

const OppfolgingsplanLink = ({ sykmeldtId, oppfolgingsplaner }: Props): ReactElement => {
    const [isPilot, setIsPilot] = useState<boolean | null>(null)
    //const { data } = useQuery(MineSykmeldteDocument)
    useEffect(() => {
        let mounted = true
        isPilotUser(sykmeldtId)
            .then((result) => {
                if (mounted) setIsPilot(result)
            })
            .catch(() => {
                if (mounted) setIsPilot(false)
            })
        return () => {
            mounted = false
        }
    }, [sykmeldtId])

    if (isPilot === null) return <></> // or loading spinner

    const baseUrl = isPilot ? `/pilot-oppfolgingsplaner/${sykmeldtId}` : `/oppfolgingsplaner/${sykmeldtId}`

    if (!oppfolgingsplaner.length) {
        return (
            <LinkPanel Icon={TasklistIcon} external="proxy" href={baseUrl}>
                Oppfølgingsplaner
            </LinkPanel>
        )
    }

    return (
        <LinkPanel
            Icon={TasklistFillIcon}
            external="proxy"
            href={`${baseUrl}?hendelser=${oppfolgingsplaner.map((it) => it.hendelseId).join('&hendelser=')}`}
            notify={{
                notify: true,
                disableWarningBackground: true,
            }}
            description={<LinkMessageList items={oppfolgingsplaner} />}
        >
            Oppfølgingsplaner
        </LinkPanel>
    )
}

export default OppfolgingsplanLink
