/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFF8F3',
        surface: '#FFFFFF',
        ink: '#241C18',
        muted: '#847A72',
        border: '#EFE4D9',
        primary: {
          DEFAULT: '#F0552B',
          dark: '#D5431E',
          light: '#FDE3D8',
        },
        secondary: {
          DEFAULT: '#1F6F54',
          dark: '#17543F',
          light: '#DCEFE7',
        },
        amber: {
          DEFAULT: '#DB9A1F',
          light: '#FBEDD1',
        },
        danger: {
          DEFAULT: '#C43D2E',
          light: '#F9DFDB',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(36, 28, 24, 0.06)',
        cardHover: '0 8px 24px rgba(36, 28, 24, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
