import React from 'react';
import { Bandage, DialogReportFilled, SuccessStroke } from '@navikt/ds-icons';
import cn from 'classnames';

import { PreviewSykmeldtFragment } from '../../../../../graphql/queries/react-query.generated';

import styles from './SykmeldtIcon.module.css';

interface Props {
    sykmeldt: PreviewSykmeldtFragment;
    notification: boolean;
}

function SykmeldtIcon({ sykmeldt, notification }: Props): JSX.Element {
    const iconVariant = getIconVariant(sykmeldt, notification);

    return (
        <div className={cn(styles.listItemPeopleIconWrapper, styles[iconVariant])}>
            <SykmeldtCardIcon variant={iconVariant} />
        </div>
    );
}

type IconVariant = 'notify' | 'sykmeldt' | 'friskmeldt';

function getIconVariant(sykmeldt: PreviewSykmeldtFragment, notification: boolean): IconVariant {
    if (notification) {
        return 'notify';
    } else if (!sykmeldt.friskmeldt) {
        return 'sykmeldt';
    } else {
        return 'friskmeldt';
    }
}

function SykmeldtCardIcon({ variant }: { variant: IconVariant }) {
    switch (variant) {
        case 'notify':
            return <DialogReportFilled fontSize="28px" focusable={false} color="var(--navds-color-red)" />;
        case 'sykmeldt':
            return <Bandage fontSize="28px" focusable={false} />;
        case 'friskmeldt':
            return <SuccessStroke fontSize="28px" focusable={false} />;
    }
}

export default SykmeldtIcon;
