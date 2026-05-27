/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sp: {
          teal:    '#00B2A9',
          tealDark:'#008B84',
          tealBg:  '#E6F7F6',
          text:    '#1A1A2E',
          bg:      '#F8F9FA',
          error:   '#E63946',
          success: '#2DC653',
          warning: '#F4A261',
          border:  '#E0E0E0',
        },
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
