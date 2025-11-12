/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRÍTICO: preset do NativeWind v4
  presets: [require('nativewind/preset')],
  
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#8A2BE2' },
        secondary: { DEFAULT: '#E9D5FF' }, // ajuste conforme necessário
        background: '#FFFFFF',
        card: '#F9FAFB',
        'muted-foreground': '#6B7280',
      },
    },
  },
  
  plugins: [],
};