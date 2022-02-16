import { useQueryClient } from 'react-query';

import { useApplicationContext } from '../components/shared/StateProvider';
import { useVirksomheterQuery, VirksomheterQuery } from '../graphql/queries/react-query.generated';
import { logger } from '../utils/logger';

function useSelectedVirksomhet(): string {
    const client = useQueryClient();
    const [state] = useApplicationContext();

    if (state.virksomhet) {
        return state.virksomhet;
    }

    const queryData: VirksomheterQuery | undefined = client.getQueryData(useVirksomheterQuery.getKey());

    if (!queryData) {
        logger.error('User without prefetched virksomheter');
        return '';
    }

    if (queryData.virksomheter.length === 0) {
        logger.warn('User without any virksomheter');
        return '';
    }

    return queryData.virksomheter[0].orgnummer;
}

export default useSelectedVirksomhet;
