/* eslint-disable @typescript-eslint/no-var-requires */

const nextJest = require('next/jest')
const dotenv = require('dotenv')

const createJestConfig = nextJest({
    dir: './src',
})

dotenv.config({
    path: '.env.test',
})

const customJestConfig = {
    moduleDirectories: ['node_modules', '<rootDir>/'],
    testEnvironment: 'jest-environment-jsdom',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/src/utils/test/**',
        '!**/pages/api/internal/**',
    ],

    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

module.exports = createJestConfig(customJestConfig)
