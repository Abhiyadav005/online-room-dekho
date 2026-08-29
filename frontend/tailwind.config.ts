import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 30px -14px rgba(15, 23, 42, .18)',
        lift: '0 20px 40px -18px rgba(15, 23, 42, .25)',
      },
      colors: {
        ink: '#17212b',
        brand: {
          50: '#effcf8',
          100: '#d7f7ed',
          200: '#b1f0e3',
          500: '#0f9b82',
          600: '#087c69',
          700: '#086456',
          900: '#103f38',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
