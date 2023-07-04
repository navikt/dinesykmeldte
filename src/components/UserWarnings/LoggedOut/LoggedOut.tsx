import React, { ReactElement } from 'react'
import { useSelector } from 'react-redux'
import { BodyLong, Button, Heading, Modal } from '@navikt/ds-react'

import { RootState } from '../../../state/store'

function LoggedOut(): ReactElement {
    const loggedOut = useSelector((state: RootState) => state.metadata.loggedOut)

    return (
        <Modal open={loggedOut} aria-labelledby="logged-out-header" onClose={() => void 0} closeButton={false}>
            <Modal.Content className="max-w-lg">
                <Heading spacing level="1" size="medium" id="logged-out-header">
                    Du har blitt logget ut
                </Heading>
                <BodyLong spacing>
                    Av sikkerhetsmessige årsaker blir du automatisk logget ut av Dine Sykmeldte etter èn time.
                </BodyLong>
                <BodyLong spacing>Logg inn på nytt for å fortsette.</BodyLong>
                <div className="my-4 flex justify-center">
                    <Button
                        variant="primary"
                        onClick={() => {
                            // Redirect to allow SSR authentication to redirect to login
                            window.location.reload()
                        }}
                    >
                        Logg inn på nytt
                    </Button>
                </div>
            </Modal.Content>
        </Modal>
    )
}

export default LoggedOut
