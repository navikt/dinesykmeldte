// eslint-disable-next-line @typescript-eslint/no-require-imports
const naviktTailwindPreset = require("@navikt/ds-tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [naviktTailwindPreset],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  // Disable Tailwind preflight so it does not override Aksel v8 layered CSS.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      listStyleType: {
        latin: "upper-latin",
      },
      maxWidth: {
        unset: "unset",
      },
    },
  },
  plugins: [],
};
