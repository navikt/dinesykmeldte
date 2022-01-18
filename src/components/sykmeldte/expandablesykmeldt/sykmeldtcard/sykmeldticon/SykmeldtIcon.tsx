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
            <SykmeldtCardIcon id={sykmeldt.narmestelederId} variant={iconVariant} />
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

function SykmeldtCardIcon({ id, variant }: { id: string; variant: IconVariant }): JSX.Element {
    switch (variant) {
        case 'notify':
            return (
                <DialogReportFilled
                    title="Sykmeldt med varsel"
                    titleId={`sykmeldt-${id}`}
                    fontSize="28px"
                    focusable={false}
                    color="var(--navds-color-red)"
                />
            );
        case 'sykmeldt':
            return <Bandage title="Sykmeldt" titleId={`sykmeldt-${id}`} fontSize="28px" focusable={false} />;
        case 'friskmeldt':
            return <SuccessStroke title="Friskmeldt" titleId={`sykmeldt-${id}`} fontSize="28px" focusable={false} />;
    }
}

export default SykmeldtIcon;
