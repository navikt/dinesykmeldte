import Link from 'next/link';
import { LinkPanel } from '@navikt/ds-react';
import { Task } from '@navikt/ds-icons';
import React from 'react';

import { PreviewSykmeldtFragment } from '../../../../graphql/queries/react-query.generated';

import { HighlightedLinkContent, PlainLinkContent } from './LinkContent';
import styles from './SykmeldtContent.module.css';

interface Props {
    sykmeldtId: string;
    soknader: NonNullable<PreviewSykmeldtFragment['previewSoknader']>;
    title: string;
    wordForms: {
        single: string;
        multiple: string;
    };
}

function SoknaderLink({ sykmeldtId, soknader, title, wordForms }: Props): JSX.Element {
    const unreadItems = soknader.filter((it) => !it.lest);

    if (unreadItems.length === 0) {
        return (
            <Link href={`/sykmeldt/${sykmeldtId}/soknader`} passHref>
                <LinkPanel>
                    <PlainLinkContent Icon={Task}>{title}</PlainLinkContent>
                </LinkPanel>
            </Link>
        );
    } else if (unreadItems.length === 1) {
        return (
            <Link href={`/sykmeldt/${sykmeldtId}/soknad/${unreadItems[0].id}`} passHref>
                <LinkPanel className={styles.panelHasNotification}>
                    <HighlightedLinkContent Icon={Task} description={`1 ulest ${wordForms.single}`}>
                        {title}
                    </HighlightedLinkContent>
                </LinkPanel>
            </Link>
        );
    } else {
        return (
            <Link href={`/sykmeldt/${sykmeldtId}/soknader`} passHref>
                <LinkPanel className={styles.panelHasNotification}>
                    <HighlightedLinkContent
                        Icon={Task}
                        description={`${unreadItems.length} uleste ${wordForms.multiple}`}
                    >
                        {title}
                    </HighlightedLinkContent>
                </LinkPanel>
            </Link>
        );
    }
}

export default SoknaderLink;
