import { Alert, BodyShort, Button, Heading, Textarea } from '@navikt/ds-react'
import { PropsWithChildren, ReactElement, useReducer } from 'react'
import { FaceSmileIcon } from '@navikt/aksel-icons'
import { useMutation } from '@apollo/client'

import { cn } from '../../utils/tw-utils'
import { FeedbackDocument } from '../../graphql/queries/graphql.generated'
import { useFlag } from '../../toggles/context'

import { feedbackReducer, initialState } from './FeedbackReducer'

type Props = {
    feedbackId: string
    metadata: Record<string, string>
}

const responseTypeToLabelMap = {
    JA: 'Er det noe du vil trekke frem? (valgfritt)',
    NEI: 'Hva synes du var utfordrene?',
    FORBEDRING: 'Hva kan forbedres?',
} as const

function GeneralFeedback({ feedbackId, metadata }: Props): ReactElement | null {
    const feedbackFlag = useFlag('DINESYKMELDTE_FLEXJAR_ROOT')
    const [{ activeResponseType, textValue, errorMessage, isComplete }, dispatch] = useReducer(
        feedbackReducer,
        initialState,
    )
    const [mutate, result] = useMutation(FeedbackDocument)

    const shouldNotShowFeedback = !feedbackFlag.enabled || localStorage.getItem('feedback-root-list') != null
    if (!isComplete && shouldNotShowFeedback) return null

    const handleSend = async (): Promise<void> => {
        if (
            (activeResponseType === 'FORBEDRING' || activeResponseType === 'NEI') &&
            (textValue == null || textValue.trim() === '')
        ) {
            dispatch({ type: 'error', message: 'Tilbakemeldingen kan ikke være tom. Legg til tekst i feltet.' })
            return
        }

        const payload = {
            feedback: textValue ?? null,
            svar: activeResponseType,
            feedbackId,
            ...metadata,
        }

        await mutate({ variables: { feedback: payload } })

        dispatch({ type: 'complete' })

        localStorage.setItem('feedback-root-list', 'true')
    }

    return (
        <section aria-label="Tilbakemelding på Dine Sykmeldte">
            <div className="w:full md:w-3/4" data-cy="feedback-wrapper">
                {!isComplete && (
                    <div className="mt-1 rounded-medium bg-surface-subtle p-6">
                        <BodyShort className="mb-6">
                            Er du fornøyd med tjenesten <span className="font-bold">Dine Sykmeldte</span>?
                        </BodyShort>
                        <div className="flex w-full gap-2">
                            <FeedbackButton
                                handleClick={() => dispatch({ type: 'feedback-type', value: 'JA' })}
                                active={activeResponseType === 'JA'}
                                disabled={result.loading}
                            >
                                Ja
                            </FeedbackButton>
                            <FeedbackButton
                                handleClick={() => dispatch({ type: 'feedback-type', value: 'NEI' })}
                                active={activeResponseType === 'NEI'}
                                disabled={result.loading}
                            >
                                Nei
                            </FeedbackButton>
                            <FeedbackButton
                                handleClick={() => dispatch({ type: 'feedback-type', value: 'FORBEDRING' })}
                                active={activeResponseType === 'FORBEDRING'}
                                disabled={result.loading}
                            >
                                Foreslå forbedring
                            </FeedbackButton>
                        </div>
                        {activeResponseType != null && (
                            <form className="mt-6 flex w-full flex-col gap-4">
                                <Textarea
                                    data-cy="feedback-textarea"
                                    error={errorMessage}
                                    label={responseTypeToLabelMap[activeResponseType]}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            e.preventDefault()
                                            await handleSend()
                                        }
                                    }}
                                    disabled={result.loading}
                                    value={textValue ?? ''}
                                    onChange={(e) => {
                                        dispatch({ type: 'input', value: e.target.value })
                                    }}
                                    maxLength={600}
                                    minRows={3}
                                    description="Obs: Ikke skriv inn navn eller andre personopplysninger."
                                />
                                <Button
                                    data-cy="send-feedback"
                                    className="mr-auto"
                                    size="small"
                                    variant="secondary-neutral"
                                    type="button"
                                    onClick={handleSend}
                                    loading={result.loading}
                                >
                                    Send tilbakemelding
                                </Button>
                            </form>
                        )}
                    </div>
                )}
                <div aria-live="polite">
                    {isComplete && (
                        <div className="mt-2 rounded-medium bg-surface-success-subtle p-6">
                            <Heading size="small" as="p" className="flex items-center">
                                Takk for tilbakemeldingen din <FaceSmileIcon className="ml-1" />
                            </Heading>
                        </div>
                    )}
                    {result.error && (
                        <Alert variant="error">
                            Vi klarte desverre ikke å ta i mot tilbakemeldingen din. Prøv gjerne igjen om litt!
                        </Alert>
                    )}
                </div>
            </div>
        </section>
    )
}

interface FeedbackButtonProps {
    handleClick: () => void
    active?: boolean
    disabled?: boolean
}

function FeedbackButton({
    active,
    disabled,
    handleClick,
    children,
}: PropsWithChildren<FeedbackButtonProps>): ReactElement {
    return (
        <Button
            variant="secondary-neutral"
            size="small"
            onClick={handleClick}
            disabled={disabled}
            className={cn({
                'bg-surface-neutral-active text-text-on-inverted hover:bg-surface-neutral-active focus:text-white':
                    active,
            })}
        >
            {children}
        </Button>
    )
}

export default GeneralFeedback
