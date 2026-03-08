/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:       '#C9A96E',
        'gold-light': '#E8D5A3',
        deep:       '#1A0A00',
        warm:       '#2D1810',
        cream:      '#FAF6EF',
        rose:       '#8B3A3A',
        text:       '#3A2015',
        muted:      '#9A7B6A',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        jost:      ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
}