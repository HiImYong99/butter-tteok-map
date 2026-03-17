/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#3182F6',
          'blue-dark': '#1B64DA',
          bg: '#F2F4F6',
          surface: '#FFFFFF',
          text: '#191F28',
          'text-sub': '#8B95A1',
          border: '#E5E8EB',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Pretendard"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
