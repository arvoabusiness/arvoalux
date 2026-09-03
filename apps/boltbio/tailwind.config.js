const preset = require("../../packages/core/tailwind-preset.cjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "../../packages/core/src/**/*.{js,ts,jsx,tsx}",
  ],
};
