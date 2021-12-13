import { createMockedSsrContext, HappyPathSsrResult } from '../utils/test/testUtils';

import { getServerSideProps } from './index.page';

describe('Index page', () => {
    describe('getServerSideProps', () => {
        it('should pre-fetch "mine sykmeldte"-query', async () => {
            const result = (await getServerSideProps(createMockedSsrContext())) as unknown as HappyPathSsrResult;

            expect(result.props.dehydratedState.queries[0].queryKey).toEqual(['Virksomheter']);
            expect(result.props.dehydratedState.queries[1].queryKey).toEqual(['MineSykmeldte']);
        });
    });
});
