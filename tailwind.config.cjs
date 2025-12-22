/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,vue,ts}",
    "./src/layouts/**/*.vue",
    "./src/pages/**/*.vue",
    "./src/plugins/**/*.{js,ts}",
    "./src/app.vue",
    "./src/error.vue",
    "./src/layers/**/*.{js,vue,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0099ff",
          dark: "#0077be",
        },
        background: {
          light: "#f5f7fa",
          dark: "#121212",
        },
        surface: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
        border: {
          light: "#e0e0e0",
          dark: "#333333",
        },
      },
    },
  },
  plugins: [],
};
