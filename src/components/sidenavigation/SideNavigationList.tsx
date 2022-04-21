import { Heading } from '@navikt/ds-react';
import { Bandage, CoApplicant, Dialog, Email, Notes, Task } from '@navikt/ds-icons';
import React from 'react';

import { formatFirstNamePossessive } from '../../utils/sykmeldtUtils';
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
                <Heading id="side-menu-header" size="small" className={styles.heading}>
                    {formatFirstNamePossessive(sykmeldt.navn, 'oversikt')}
                </Heading>
            )}
            <ul className={styles.buttonList}>
                <SideNavigationMenuItem
                    page="sykmeldinger"
                    childPage="sykmelding"
                    icons={{ Normal: Bandage }}
                    notifications={sykmeldt.sykmeldinger.filter((it) => !it.lest).length}
                    href={`/sykmeldt/${sykmeldt.narmestelederId}/sykmeldinger`}
                >
                    {activePage === 'sykmelding' ? 'Alle sykmeldinger' : 'Sykmeldinger'}
                </SideNavigationMenuItem>
                {activePage === 'sykmelding' && <ActiveSubItem Icon={Bandage}>Sykmelding</ActiveSubItem>}
                <SideNavigationMenuItem
                    page="soknader"
                    childPage="soknad"
                    icons={{ Normal: Task }}
                    notifications={sykmeldt.previewSoknader.filter((it) => isPreviewSoknadNotification(it)).length}
                    href={`/sykmeldt/${sykmeldt.narmestelederId}/soknader`}
                >
                    {activePage === 'soknad' ? 'Alle søknader' : 'Søknader'}
                </SideNavigationMenuItem>
                {activePage === 'soknad' && <ActiveSubItem Icon={Task}>Søknad</ActiveSubItem>}
                <SideNavigationMenuItem
                    icons={{ Normal: Dialog }}
                    notifications={sykmeldt.dialogmoter.length}
                    href={`/dialogmoter/${sykmeldt.narmestelederId}`}
                    external="proxy"
                >
                    Dialogmøter
                </SideNavigationMenuItem>
                <SimpleSideNavigationMenuItem
                    href={`/oppfolgingsplaner/${sykmeldt.narmestelederId}`}
                    Icon={Notes}
                    external="relative"
                    notifications={sykmeldt.oppfolgingsplaner.length}
                >
                    Oppfølgingsplaner
                </SimpleSideNavigationMenuItem>
                {sykmeldt.aktivitetsvarsler.length > 0 && (
                    <SideNavigationMenuItem
                        page="meldinger"
                        childPage="melding"
                        href={`/sykmeldt/${sykmeldt.narmestelederId}/meldinger`}
                        icons={{ Normal: Email }}
                        notifications={sykmeldt.aktivitetsvarsler.filter((it) => !it.lest).length}
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
