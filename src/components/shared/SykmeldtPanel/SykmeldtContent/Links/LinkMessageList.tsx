import React from 'react'

import { DialogmoteFragment, OppfolgingsplanFragment } from '../../../../../graphql/queries/graphql.generated'

interface Props {
    items: DialogmoteFragment[] | OppfolgingsplanFragment[]
}

function LinkMessageList({ items }: Props): JSX.Element {
    return (
        <ul className="mt-1 max-w-full list-disc pl-4">
            {items.map((it) => (
                <li className="mb-1" key={it.hendelseId}>
                    {it.tekst}
                </li>
            ))}
        </ul>
    )
}

export default LinkMessageList
