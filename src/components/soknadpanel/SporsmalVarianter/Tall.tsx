import React from 'react';
import { BodyShort, Heading } from '@navikt/ds-react';

import { cleanId } from '../../../utils/stringUtils';
import { SoknadSporsmalFragment, SoknadSporsmalSvartypeEnum } from '../../../graphql/queries/graphql.generated';

import { SporsmalVarianterProps } from './SporsmalVarianter';
// eslint-disable-next-line postcss-modules/no-unused-class
import styles from './SporsmalVarianter.module.css';

function Tall({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);
    const nestedListItemId = cleanId('nested-list-item-id');

    function setLabel(sporsmal: SoknadSporsmalFragment): string {
        switch (sporsmal.svartype) {
            case SoknadSporsmalSvartypeEnum.Prosent:
                return 'prosent';
            case SoknadSporsmalSvartypeEnum.Timer:
                return 'timer totalt';
            case SoknadSporsmalSvartypeEnum.Belop:
                return 'kr';
            case SoknadSporsmalSvartypeEnum.Kilometer:
                return 'km';
            default:
                return '';
        }
    }
    const label = sporsmal.undertekst || setLabel(sporsmal);

    if (!sporsmal.svar || !sporsmal.svar[0]) return null;

    return (
        <li className={styles.listItem} aria-labelledby={listItemId}>
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            <ul className={styles.listItemList}>
                {sporsmal.svar.map((svar, index) => {
                    return (
                        <li className={styles.nestedListItem} key={index} aria-labelledby={nestedListItemId + index}>
                            <BodyShort id={nestedListItemId + index} className="test" size="small">
                                {svar?.verdi} {label}
                            </BodyShort>
                        </li>
                    );
                })}
            </ul>
        </li>
    );
}

export default Tall;
