/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        khaki: 'var(--khaki)',
        coffee: 'var(--coffee)',
        silver: 'var(--silver-lake-blue)',
        delft: 'var(--delft-blue)',
        navy: 'var(--navy-blue)',
      },
    },
  },
  plugins: [],
};
