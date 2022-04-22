import { Heading } from '@navikt/ds-react';
import {
    Bandage,
    BandageFilled,
    CoApplicant,
    Dialog,
    DialogFilled,
    Email,
    EmailFilled,
    Notes,
    Task,
    TaskFilled,
} from '@navikt/ds-icons';
import React from 'react';

import { formatNamePossessive } from '../../utils/sykmeldtUtils';
import { PreviewSykmeldtFragment } from '../../graphql/queries/graphql.generated';
import { isPreviewSoknadNotification } from '../../utils/soknadUtils';

import { ActiveSubItem, SideNavigationMenuItem, SimpleSideNavigationMenuItem } from './SideNavigationMenuItem';
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
                    {formatNamePossessive(sykmeldt.navn, 'dokumenter')}
                </Heading>
            )}
            <ul className={styles.buttonList}>
                <SideNavigationMenuItem
                    page="sykmeldinger"
                    childPage="sykmelding"
                    icons={{ Normal: Bandage, Notify: BandageFilled }}
                    notify={sykmeldt.sykmeldinger.some((it) => !it.lest)}
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
                    Søknader om sykepenger
                </SideNavigationMenuItem>
                {activePage === 'soknad' && <ActiveSubItem Icon={CoApplicant}>Soknad</ActiveSubItem>}
                <SideNavigationMenuItem
                    icons={{ Normal: Dialog, Notify: DialogFilled }}
                    notify={sykmeldt.dialogmoter.length > 0}
                    href={`/dialogmoter/${sykmeldt.narmestelederId}`}
                    external="proxy"
                >
                    Dialogmøter
                </SideNavigationMenuItem>
                <SimpleSideNavigationMenuItem
                    href={`/oppfolgingsplaner/${sykmeldt.narmestelederId}`}
                    Icon={Notes}
                    external="relative"
                >
                    Oppfølgingsplaner
                </SimpleSideNavigationMenuItem>
                {sykmeldt.aktivitetsvarsler.length > 0 && (
                    <SideNavigationMenuItem
                        page="meldinger"
                        childPage="melding"
                        href={`/sykmeldt/${sykmeldt.narmestelederId}/meldinger`}
                        icons={{ Normal: Email, Notify: EmailFilled }}
                        notify={sykmeldt.aktivitetsvarsler.some((it) => !it.lest)}
                    >
                        Beskjeder
                    </SideNavigationMenuItem>
                )}
                {activePage === 'melding' && <ActiveSubItem Icon={Email}>Aktivitetsvarsel</ActiveSubItem>}
                <SimpleSideNavigationMenuItem href="/" Icon={CoApplicant} className={styles.lastItem}>
                    Dine sykmeldte
                </SimpleSideNavigationMenuItem>
            </ul>
        </>
    );
}

export default SideNavigationList;
