import { z } from 'zod'

export type OppfolgingsplanApi = z.infer<typeof OppfolgingsplanSchema>
export const OppfolgingsplanSchema = z.object({
    hendelseId: z.string(),
    tekst: z.string().nullable(),
})
