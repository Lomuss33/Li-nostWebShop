import type { Config } from 'tailwindcss'
export default <Partial<Config>>{
  content: ['./app/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      colors: { paper: '#f3eee4', ink: '#172038', muted: '#6d685f', heritageRed: '#a62532', heritageBlue: '#203d70', heritageGold: '#b18a4a' },
    },
  },
  plugins: [],
}
