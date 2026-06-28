import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FBF3E9',
        accent: '#A8736D',
        'accent-mid': '#C99892',
        'accent-light': '#F4D5D2',
        ink: '#4A3F39',
        'ink-dark': '#5A4A43',
        sub: '#8A7E76',
        'sub-light': '#A2948A',
        'sub-xlight': '#B6A89D',
        border: '#F0E1D5',
        'border-mid': '#EAD9CB',
        ok: '#5E8268',
        'ok-bg': '#E5EFE7',
        low: '#B0822C',
        'low-bg': '#FBEBCF',
        out: '#C0635C',
        'out-bg': '#F7DBD6',
        sage: '#6E8483',
        'sage-bg': '#DCE5E5',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      keyframes: {
        mdIn: {
          from: { opacity: '0', transform: 'translateY(10px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        ovIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translate(-50%, 12px)' },
          to: { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        mdIn: 'mdIn 0.4s ease both',
        mdInFast: 'mdIn 0.28s ease both',
        ovIn: 'ovIn 0.2s ease both',
        toastIn: 'toastIn 0.3s ease both',
      },
    },
  },
  plugins: [],
}
export default config
