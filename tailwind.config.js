/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#020308',
        primary: {
          DEFAULT: '#1e60ff',
        }
      }
    }
  },
  plugins: [],
}
