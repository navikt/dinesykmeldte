import { z } from 'zod'

export type DialogmoteApi = z.infer<typeof DialogmoteSchema>
export const DialogmoteSchema = z.object({
    hendelseId: z.string(),
    tekst: z.string().nullable(),
})
