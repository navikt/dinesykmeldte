import { describe, it, expect } from 'vitest'

import {
    createPreviewFremtidigSoknad,
    createPreviewNySoknad,
    createPreviewSendtSoknad,
} from '../../../utils/test/dataCreators'
import { render } from '../../../utils/test/testUtils'
import { dateAdd, dateSub } from '../../../utils/dateUtils'

import SoknadTag from './SoknadTag'

describe('SoknadTag', () => {
    describe('given ny søknad', () => {
        it('should show tag with varsel', () => {
            const { container } = render(<SoknadTag soknad={createPreviewNySoknad({ ikkeSendtSoknadVarsel: true })} />)

            expect(container).toHaveTextContent('Ikke sendt')
        })

        it('should not show tag without varsel', () => {
            const { container } = render(<SoknadTag soknad={createPreviewNySoknad({ ikkeSendtSoknadVarsel: false })} />)

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('given fremtidig søknad', () => {
        it('should show tag when activation is future', () => {
            const { container } = render(
                <SoknadTag
                    soknad={createPreviewFremtidigSoknad({
                        tom: dateAdd(new Date(), { days: 0 }),
                    })}
                />,
            )

            expect(container).toHaveTextContent(/Aktiveres/)
        })

        it('should not show tag when activation is today', () => {
            const { container } = render(
                <SoknadTag
                    soknad={createPreviewFremtidigSoknad({
                        tom: dateSub(new Date(), { days: 1 }),
                    })}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('should not show tag when activation is yesterday', () => {
            const { container } = render(
                <SoknadTag
                    soknad={createPreviewFremtidigSoknad({
                        tom: dateSub(new Date(), { days: 2 }),
                    })}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('given sendt søknad', () => {
        it('should show tag korrigererSøknad has a value', () => {
            const { container } = render(
                <SoknadTag
                    soknad={createPreviewSendtSoknad({
                        korrigererSoknadId: 'eplekake',
                    })}
                />,
            )

            expect(container).toHaveTextContent(/Korrigering/)
        })

        it('should not show tag korrigererSøknad is null', () => {
            const { container } = render(
                <SoknadTag
                    soknad={createPreviewSendtSoknad({
                        korrigererSoknadId: null,
                    })}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })
    })
})
