import { describe, it, expect } from 'vitest'

import { FakeMockDB } from './mockDb'

describe('mockData', () => {
    it('should mark sykmelding as read', async () => {
        const db = new FakeMockDB()
        const sykmeldingId = '8317b5df-0a42-4b2b-a1de-fccbd9aca63a'

        expect((await db.getSykmelding(sykmeldingId)).lest).toBe(false)
        db.markSykmeldingRead(sykmeldingId)
        expect((await db.getSykmelding(sykmeldingId)).lest).toBe(true)
    })

    it('should mark sendt søknad as read', async () => {
        const db = new FakeMockDB()
        const soknadId = '01206017-dbcf-4f35-ac1f-8cbd2f76d012'

        expect((await db.getSoknad(soknadId)).lest).toBe(false)
        db.markSoknadRead(soknadId)
        expect((await db.getSoknad(soknadId)).lest).toBe(true)
    })
})
