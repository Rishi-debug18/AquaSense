/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0EA5E9',
          dark: '#0369A1',
          navy: '#0C1F3F'
        },
        status: {
          normal: '#22C55E',
          warning: '#EAB308',
          critical: '#EF4444',
          info: '#3B82F6'
        },
        background: {
          household: '#F0F9FF',
          admin: '#F8FAFC',
          card: '#FFFFFF'
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569'
        }
      }
    },
  },
  plugins: [],
}
