
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
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
