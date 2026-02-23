/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-dark': '#0f0f0f',
        'surface-light': '#1a1a1a',
      },
      boxShadow: {
        'elevated': '0 30px 100px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
