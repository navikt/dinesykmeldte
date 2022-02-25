import React from 'react';
import { Button } from '@navikt/ds-react';
import { Collapse } from '@navikt/ds-icons';

import styles from './AccordionCloseButton.module.css';

function AccordionCloseButton({ onClick }: { onClick: () => void }): JSX.Element {
    return (
        <div className={styles.accordionCloseButton}>
            <Button variant="tertiary" size="small" onClick={onClick}>
                Lukk
                <Collapse />
            </Button>
        </div>
    );
}

export default AccordionCloseButton;
