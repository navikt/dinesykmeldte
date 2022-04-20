import { BodyShort, Heading, Link, Modal } from '@navikt/ds-react';
import React from 'react';

function NoJsWarning(): JSX.Element {
    return (
        <noscript>
            <Modal open onClose={() => void 0} closeButton={false}>
                <Modal.Content>
                    <Heading level="2" size="large" spacing>
                        Dine Sykmeldte krever JavaScript
                    </Heading>
                    <BodyShort spacing>For å bruke Dine Sykmeldte må nettleseren din ha aktivert JavaScript.</BodyShort>
                    <BodyShort>
                        Dersom du trenger hjelp til å aktivere JavaScript i din nettleser kan du finne det{' '}
                        <Link
                            href="https://support.google.com/adsense/answer/12654?hl=no"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            her
                        </Link>
                    </BodyShort>
                </Modal.Content>
            </Modal>
        </noscript>
    );
}

export default NoJsWarning;
