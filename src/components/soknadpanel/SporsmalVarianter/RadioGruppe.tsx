import React from 'react';
import { Heading } from '@navikt/ds-react';
import cn from 'classnames';

import { SoknadSporsmalFragment, SoknadSporsmalSvartypeEnum } from '../../../graphql/queries/graphql.generated';
import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { cleanId } from '../../../utils/stringUtils';

import { SporsmalVarianterProps, SvarEnum } from './SporsmalVarianter';
import Undersporsmal from './Undersporsmal';
// eslint-disable-next-line postcss-modules/no-unused-class
import styles from './SporsmalVarianter.module.css';

function RadioGruppe({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);

    if (!sporsmal.undersporsmal || sporsmal.undersporsmal.length === 0) return null;

    const besvartUndersporsmal =
        sporsmal.undersporsmal &&
        sporsmal.undersporsmal.find((underspm) => {
            return underspm?.svar && underspm.svar[0] && underspm.svar[0].verdi === SvarEnum.CHECKED;
        });

    if (!besvartUndersporsmal) return null;

    const besvartUnderspm = besvartUndersporsmal.undersporsmal as SoknadSporsmalFragment[];

    return (
        <li
            className={cn({
                [styles.listItem]:
                    besvartUndersporsmal.undersporsmal && besvartUndersporsmal.undersporsmal.length === 0,
            })}
            aria-labelledby={listItemId}
        >
            <Heading id={listItemId} size="xsmall" level="4">
                {sporsmal.sporsmalstekst}
            </Heading>
            {sporsmal.svartype === SoknadSporsmalSvartypeEnum.RadioGruppe && (
                <CheckboxExplanation text={besvartUndersporsmal.sporsmalstekst} />
            )}
            {besvartUndersporsmal.undersporsmal && besvartUndersporsmal.undersporsmal.length > 0 && (
                <Undersporsmal sporsmalsliste={besvartUnderspm} />
            )}
        </li>
    );
}

export default RadioGruppe;
