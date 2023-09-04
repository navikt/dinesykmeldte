import { describe, it, expect } from 'vitest'
import { parseISO } from 'date-fns'

import { formatDatePeriod } from './dateUtils'

describe('formatDatePeriod', () => {
    it('should format range when in same month', () => {
        expect(formatDatePeriod(parseISO('2020-04-07'), parseISO('2020-04-15'))).toEqual('7. - 15. april 2020')
    })

    it('should format range when in same year', () => {
        expect(formatDatePeriod(parseISO('2020-02-07'), parseISO('2020-04-15'))).toEqual('7. februar - 15. april 2020')
    })

    it('should format range when in different years', () => {
        expect(formatDatePeriod(parseISO('2019-02-07'), parseISO('2020-04-15'))).toEqual(
            '7. februar 2019 - 15. april 2020',
        )
    })
})
