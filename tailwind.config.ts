/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          500: "#3730a3",
          600: "#1e1b4b",
          700: "#17144a",
          800: "#110e3a",
          900: "#0b0a2e",
        },
      },
    },
  },
  plugins: [],
};
