// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ABChanel Corpo', 'sans-serif'], // лишаєш для body
        montserrat: ['Montserrat', 'sans-serif'], // додаєш Montserrat
      },
    },
  },
  plugins: [],
};
