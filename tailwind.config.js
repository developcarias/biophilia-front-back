
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.tsx",
    "./pages/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green-dark': '#166534',
        'brand-green': '#15803d',
        'brand-green-light': '#f0fdf4',
        'brand-accent': '#10b981',
        'brand-gray': '#4a5568',
        'brand-yellow': '#facc15',
      },
    },
  },
  plugins: [],
}
