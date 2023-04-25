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
            maxWidth: {
                unset: 'unset',
                6: '1.5rem',
            },
            flex: {
                50: '1 1 50%',
                90: '1 0 90%',
            },
        },
    },
    plugins: [],
}
