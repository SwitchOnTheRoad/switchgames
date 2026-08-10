/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0B0F19',
        primary: {
          DEFAULT: '#FF5C00',
        }
      }
    }
  },
  plugins: [],
}
