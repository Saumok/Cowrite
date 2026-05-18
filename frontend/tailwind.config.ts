import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF7F2',
        surface: '#F5F0E8',
        'surface-glass': 'rgba(255, 252, 248, 0.72)',
        elevated: '#EDE8DF',
        overlay: 'rgba(250, 247, 242, 0.85)',
        accent: {
          DEFAULT: '#C4785A',
          light: '#F2E6DF',
          glass: 'rgba(196, 120, 90, 0.15)',
        },
        sage: {
          DEFAULT: '#7A9E8E',
          light: '#E4F0EC',
        },
        blob: {
          orange: '#F4A96A',
          blush: '#F2C4B8',
          sage: '#A8C4B8',
          sky: '#A8C0D6',
        },
        text: {
          heading: '#2C2420',
          body: '#4A3F38',
          secondary: '#9C8A80',
          muted: '#C4B5AD',
          inverse: '#FAF7F2',
        },
        border: {
          DEFAULT: 'rgba(196, 181, 173, 0.4)',
          focus: 'rgba(196, 120, 90, 0.6)',
          glass: 'rgba(255, 255, 255, 0.6)',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      fontSize: {
        display: 'clamp(2rem, 5vw, 3.5rem)',
        h1: 'clamp(1.5rem, 3vw, 2rem)',
        h2: '1.25rem',
        h3: '1rem',
        body: '0.9375rem',
        small: '0.8125rem',
        label: '0.75rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(44, 36, 32, 0.06), 0 1px 3px rgba(44, 36, 32, 0.04)',
        card: '0 4px 24px rgba(44, 36, 32, 0.08), 0 1px 4px rgba(44, 36, 32, 0.04)',
        modal: '0 24px 64px rgba(44, 36, 32, 0.14), 0 8px 24px rgba(44, 36, 32, 0.08)',
        glass: '0 8px 32px rgba(44, 36, 32, 0.10), inset 0 1px 0 rgba(255,255,255,0.8)',
        inset: 'inset 0 2px 6px rgba(44, 36, 32, 0.06)',
      },
      animation: {
        'blob-drift': 'blobDrift 60s ease-in-out infinite alternate',
        'modal-enter': 'modalEnter 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'page-enter': 'pageEnter 400ms ease-out',
        'card-enter': 'cardEnter 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        pulse: 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        blobDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(30px, 20px) scale(1.05)' },
        },
        modalEnter: {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pageEnter: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        cardEnter: {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
