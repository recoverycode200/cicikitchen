/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      primary: {
        50: '#fff0eb',
        100: '#ffe0d2',
        200: '#ffc2a6',
        300: '#ff9e70',
        400: '#ff7a3a',
        500: '#FF6B35',
        600: '#e84a10',
        700: '#c13b0c',
        800: '#9a3110',
        900: '#7d2c12',
        950: '#431407',
      },
      secondary: {
        50: '#f0fdf6',
        100: '#dcfce9',
        200: '#bbf7d4',
        300: '#86efae',
        400: '#4CD964',
        500: '#4CB963',
        600: '#20953d',
        700: '#1b7c33',
        800: '#1a612c',
        900: '#175126',
        950: '#062c12',
      },
      neutral: {
        50: '#f9f7f5',
        100: '#f1eee8',
        200: '#e3ddd3',
        300: '#d3c9b9',
        400: '#baa996',
        500: '#a8937c',
        600: '#9c816c',
        700: '#876d5c',
        800: '#6f594d',
        900: '#5b4a41',
        950: '#302620',
      },
      red: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
      },
      green: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
      },
      yellow: {
        50: '#fefce8',
        500: '#eab308',
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
        serif: ['Nunito', 'sans-serif'],
      },
    },
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
