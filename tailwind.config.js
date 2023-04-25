/* eslint-disable @typescript-eslint/no-var-requires */

const naviktTailwindPreset = require('@navikt/ds-tailwind')

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [naviktTailwindPreset],
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            listStyleType: {
                latin: 'upper-latin',
            },
            minWidth: {
                240: '240px',
            },
            maxWidth: {
                224: '224px',
                unset: 'unset',
            },
        },
    },
    plugins: [],
}
