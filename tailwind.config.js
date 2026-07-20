/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        islamic: {
          lightGreen: "#d1fae5", // emerald-100
          green: "#064e3b",      // emerald-900 (Deep Islamic green)
          darkGreen: "#022c22",  // emerald-950 (Very deep green background)
          gold: "#c29b38",       // Islamic metallic gold
          lightGold: "#f59e0b",  // amber-500
          darkGold: "#b45309",   // amber-700
          alabaster: "#fafaf9",  // stone-50 (Cream/off-white)
          darkBg: "#0f172a",     // slate-900 (For general dark mode background)
          darkCard: "#1e293b",   // slate-800
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaliq"', 'serif']
      }
    },
  },
  plugins: [],
}
