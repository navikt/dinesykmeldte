import React from 'react'

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/graphql.generated'

import SykmeldingerLink from './Links/SykmeldingerLink'
import SoknaderLink from './Links/SoknaderLink'
import DialogmoteLink from './Links/DialogmoteLink'
import OppfolgingsplanLink from './Links/OppfolgingsplanLink'
import AktivitetsvarselLink from './Links/AktivitetsvarselLink'

interface Props {
    sykmeldt: PreviewSykmeldtFragment
    notification: boolean
}

function SykmeldtContent({ sykmeldt }: Props): JSX.Element {
    return (
        <div className="flex flex-col gap-2">
            <SykmeldingerLink sykmeldtId={sykmeldt.narmestelederId} sykmeldinger={sykmeldt.sykmeldinger} />
            <SoknaderLink sykmeldtId={sykmeldt.narmestelederId} soknader={sykmeldt.previewSoknader} />
            <DialogmoteLink sykmeldtId={sykmeldt.narmestelederId} dialogmoter={sykmeldt.dialogmoter} />
            <OppfolgingsplanLink sykmeldtId={sykmeldt.narmestelederId} oppfolgingsplaner={sykmeldt.oppfolgingsplaner} />
            <AktivitetsvarselLink
                sykmeldtId={sykmeldt.narmestelederId}
                aktivitetsvarsler={sykmeldt.aktivitetsvarsler}
            />
        </div>
    )
}

export default SykmeldtContent
