import { Heading } from '@navikt/ds-react';
import { Bandage, BandageFilled, CoApplicant, Dialog, DialogFilled, Notes, Task, TaskFilled } from '@navikt/ds-icons';
import React from 'react';

import { formatNamePossessive } from '../../utils/sykmeldtUtils';
import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';
import { isPreviewSoknadNotification } from '../../utils/soknadUtils';
import { createOppfolgingsplanUrl } from '../shared/SykmeldtPanel/SykmeldtContent/Links/OppfolgingsplanLink';

import { ActiveSubItem, SideNavigationMenuItem } from './SideNavigationMenuItem';
import styles from './SideNavigationList.module.css';
import { useActivePage } from './useActivePage';

function SideNavigationList({
    sykmeldt,
    noHeader = false,
}: {
    sykmeldt: PreviewSykmeldtFragment;
    noHeader?: boolean;
}): JSX.Element {
    const activePage = useActivePage();

    return (
        <>
            {!noHeader && (
                <Heading id="side-menu-header" size="medium" className={styles.heading}>
                    {formatNamePossessive(sykmeldt, 'dokumenter')}
                </Heading>
            )}
            <ul className={styles.buttonList}>
                <SideNavigationMenuItem
                    page="sykmeldinger"
                    childPage="sykmelding"
                    icons={{ Normal: Bandage, Notify: BandageFilled }}
                    notify={sykmeldt.previewSykmeldinger.some((it) => !it.lest)}
                    href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`}
                >
                    Sykmeldinger
                </SideNavigationMenuItem>
                {activePage === 'sykmelding' && <ActiveSubItem Icon={Bandage}>Sykmelding</ActiveSubItem>}
                <SideNavigationMenuItem
                    page="soknader"
                    childPage="soknad"
                    icons={{ Normal: Task, Notify: TaskFilled }}
                    notify={sykmeldt.previewSoknader.some((it) => isPreviewSoknadNotification(it))}
                    href={`/sykmeldt/${sykmeldt.narmestelederId}/soknader`}
                >
                    Søknader om sykmeldinger
                </SideNavigationMenuItem>
                {activePage === 'soknad' && <ActiveSubItem Icon={CoApplicant}>Soknad</ActiveSubItem>}
                <SideNavigationMenuItem
                    icons={{ Normal: Dialog, Notify: DialogFilled }}
                    notify={sykmeldt.dialogmoter.length > 0}
                    href={`/dialogmoter/${sykmeldt.narmestelederId}`}
                    external
                >
                    Dialogmøter
                </SideNavigationMenuItem>
                <SideNavigationMenuItem href={createOppfolgingsplanUrl(sykmeldt.narmestelederId)} Icon={Notes} external>
                    Oppfølgingsplaner
                </SideNavigationMenuItem>
                <SideNavigationMenuItem href="/" Icon={CoApplicant} className={styles.lastItem}>
                    Dine sykmeldte
                </SideNavigationMenuItem>
            </ul>
        </>
    );
}

export default SideNavigationList;
