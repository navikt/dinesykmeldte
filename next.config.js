/* eslint-disable @typescript-eslint/no-var-requires */

const withTranspileModules = require('next-transpile-modules')([
    '@navikt/nav-dekoratoren-moduler',
    '@navikt/ds-react',
    '@navikt/ds-icons',
    '@navikt/frontendlogger',
]);

module.exports = withTranspileModules({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
});
