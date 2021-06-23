import React from 'react';

import { useArglessTestQueryQuery, useTestQueryQuery } from '../graphql/queries/react-query.generated';

function TestComponent(): JSX.Element {
    const { data, error, isError, isLoading } = useTestQueryQuery({ baz: 'hey' });
    const arglessResult = useArglessTestQueryQuery({});

    // TODO remove
    console.log(arglessResult);

    if (isError) return <div>{error?.message ?? 'Unknown error'}</div>;
    if (isLoading) return <div>Laster...!</div>;

    return <div>{data?.foo}</div>;
}

export default TestComponent;
