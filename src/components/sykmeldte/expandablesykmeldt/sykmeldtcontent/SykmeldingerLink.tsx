import Link from 'next/link';
import { LinkPanel } from '@navikt/ds-react';
import { Bandage } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';

import { HighlightedLinkContent, PlainLinkContent } from './LinkContent';
import styles from './SykmeldtContent.module.css';

interface Props {
    sykmeldtId: string;
    sykmeldinger: NonNullable<PreviewSykmeldtFragment['previewSykmeldinger']>;
}

function SykmeldingerLink({ sykmeldtId, sykmeldinger }: Props): JSX.Element {
    const unreadItems = sykmeldinger.filter((it) => !it.lest);

    if (unreadItems.length === 0) {
        return (
            <Link href={`/sykmeldt/${sykmeldtId}/sykmeldinger`} passHref>
                <LinkPanel>
                    <PlainLinkContent Icon={Bandage}>Sykmeldinger</PlainLinkContent>
                </LinkPanel>
            </Link>
        );
    } else if (unreadItems.length === 1) {
        return (
            <Link href={`/sykmeldt/${sykmeldtId}/sykmelding/${unreadItems[0].id}`} passHref>
                <LinkPanel className={styles.panelHasNotification}>
                    <HighlightedLinkContent Icon={Bandage} description={`1 ulest sykmelding`}>
                        Sykmeldinger
                    </HighlightedLinkContent>
                </LinkPanel>
            </Link>
        );
    } else {
        return (
            <Link href={`/sykmeldt/${sykmeldtId}/sykmeldinger`} passHref>
                <LinkPanel className={styles.panelHasNotification}>
                    <HighlightedLinkContent Icon={Bandage} description={`${unreadItems.length} uleste sykmeldinger`}>
                        Sykmeldinger
                    </HighlightedLinkContent>
                </LinkPanel>
            </Link>
        );
    }
}

export default SykmeldingerLink;
