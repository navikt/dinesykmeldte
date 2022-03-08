import React from 'react';
import { Link } from '@navikt/ds-react';
import { Back } from '@navikt/ds-icons';
import cn from 'classnames';

import styles from './TilbakeLink.module.css';

interface TilbakeLinkProps {
    text: string;
    className?: string;
    href: string;
}

function TilbakeLink({ text, className, href }: TilbakeLinkProps): JSX.Element {
    return (
        <Link className={cn({ [styles.tilbakeLink]: !className })} href={href}>
            <Back />
            {text}
        </Link>
    );
}
export default TilbakeLink;
