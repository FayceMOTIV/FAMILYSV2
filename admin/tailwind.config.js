/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C62828',
        gold: '#FFD54F',
        dark: '#121212',
      },
    },
  },
  plugins: [],
}
