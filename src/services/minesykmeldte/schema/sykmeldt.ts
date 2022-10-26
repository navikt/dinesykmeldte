import { z } from 'zod'

import { AktivitetsvarselSchema } from './melding'
import { SykmeldingSchema } from './sykmelding'
import { PreviewSoknadSchema } from './soknad'
import { DialogmoteSchema } from './dialogmote'
import { OppfolgingsplanSchema } from './oppfolgingsplan'

export type PreviewSykmeldtApi = z.infer<typeof PreviewSykmeldtSchema>
export const PreviewSykmeldtSchema = z.object({
    narmestelederId: z.string(),
    orgnummer: z.string(),
    orgnavn: z.string(),
    fnr: z.string(),
    navn: z.string(),
    friskmeldt: z.boolean(),
    aktivitetsvarsler: z.array(AktivitetsvarselSchema),
    sykmeldinger: z.array(SykmeldingSchema),
    previewSoknader: z.array(PreviewSoknadSchema),
    dialogmoter: z.array(DialogmoteSchema),
    oppfolgingsplaner: z.array(OppfolgingsplanSchema),
})

export const MineSykmeldteApiSchema = z.array(PreviewSykmeldtSchema)
