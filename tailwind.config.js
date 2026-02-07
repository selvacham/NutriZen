/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        zen: {
          teal: '#2DD4BF',
          emerald: '#10B981',
          slate: '#0f172a',
        }
      },
    },
  },
  plugins: [],
}
