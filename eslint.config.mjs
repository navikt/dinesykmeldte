import path from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'
import nextPlugin from '@next/eslint-plugin-next'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...compat.extends('@navikt/eslint-config-teamsykmelding'),
    {
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            // React 17+ with new JSX transform doesn't require React in scope
            'react/react-in-jsx-scope': 'off',
        },
    },
    {
        ignores: ['.next/', 'node_modules/', '.yarn/'],
    },
]
