import React from 'react';

import { DialogmoteFragment, OppfolgingsplanFragment } from '../../../../../graphql/queries/graphql.generated';

import styles from './LinkMessageList.module.css';

interface Props {
    items: DialogmoteFragment[] | OppfolgingsplanFragment[];
}

function LinkMessageList({ items }: Props): JSX.Element {
    return (
        <ul className={styles.hendelseList}>
            {items.map((it) => (
                <li key={it.hendelseId}>{it.tekst}</li>
            ))}
        </ul>
    );
}

export default LinkMessageList;
