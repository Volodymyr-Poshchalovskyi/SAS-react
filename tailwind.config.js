// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Ваші налаштування шрифтів залишаються без змін
      fontFamily: {
        sans: ['ABChanel Corpo', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },

      // Сюди додаємо налаштування для розмиття
      backdropBlur: {
        'xs': '2px', // Це створить новий клас: backdrop-blur-xs
      },
    },
  },
  plugins: [],
};