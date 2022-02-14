import { expect } from '@jest/globals';
import nock from 'nock/types';

import { waitFor } from './testUtils';

expect.extend({
    async toHaveNoMoreMocks(scope: nock.Scope) {
        await waitFor(() => scope.isDone());
        try {
            await waitUntil(() => scope.pendingMocks().length === 0);
            return {
                message: () => `expected scope to still have pending mocks`,
                pass: true,
            };
        } catch (e) {
            const mocks = scope.pendingMocks();
            return {
                message: () => `expected scope to not have any more pending mocks, there still are ${mocks.length}
   ${mocks.join('   \n')}`,
                pass: false,
            };
        }
    },
});

async function waitUntil(predicate: () => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        let retry = 0;

        const execute = async (): Promise<void> => {
            if (predicate()) {
                return resolve();
            }

            if (retry++ > 5) {
                reject('Timed out');
            }

            setTimeout(execute, 500);
        };

        execute();
    });
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toHaveNoMoreMocks(): R;
        }
    }
}
