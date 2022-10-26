import { z } from 'zod'

export type VirksomhetApi = z.infer<typeof VirksomhetSchema>
const VirksomhetSchema = z.object({
    navn: z.string(),
    orgnummer: z.string(),
})

export const VirksomheterApiSchema = z.array(VirksomhetSchema)
