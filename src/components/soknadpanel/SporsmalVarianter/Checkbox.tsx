import React from 'react';
import cn from 'classnames';

import CheckboxExplanation from '../../shared/checkboxexplanation/CheckboxExplanation';
import { SoknadSporsmalFragment } from '../../../graphql/queries/graphql.generated';
import { cleanId } from '../../../utils/stringUtils';

import { SporsmalVarianterProps, SvarEnum } from './SporsmalVarianter';
import Undersporsmal from './Undersporsmal';
// eslint-disable-next-line postcss-modules/no-unused-class
import styles from './SporsmalVarianter.module.css';

function Checkbox({ sporsmal }: SporsmalVarianterProps): JSX.Element | null {
    const listItemId = cleanId(sporsmal.sporsmalstekst);
    const underspm = sporsmal.undersporsmal as SoknadSporsmalFragment[];

    if (sporsmal.svar && sporsmal.svar[0]?.verdi !== SvarEnum.CHECKED) return null;

    return (
        <li className={cn({ [styles.listItem]: underspm.length === 0 })} aria-labelledby={listItemId}>
            <CheckboxExplanation text={sporsmal.sporsmalstekst} alignStart />
            {underspm.length > 0 && <Undersporsmal sporsmalsliste={underspm} />}
        </li>
    );
}

export default Checkbox;
