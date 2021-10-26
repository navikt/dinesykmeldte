import { join } from 'path';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

import resolvers from './resolvers';

const loadedFiles = loadFilesSync(join(process.cwd(), './**/*.graphqls'));
const typeDefs = mergeTypeDefs(loadedFiles);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

export default schema;
