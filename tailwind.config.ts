import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#080807', surface: '#0F0F0E', card: '#161614', hover: '#1E1E1B' },
        ink: { DEFAULT: '#EDEDEA', muted: '#848078', subtle: '#46433F' },
        accent: { DEFAULT: '#C8FF3D', dim: 'rgba(200,255,61,0.07)', glow: 'rgba(200,255,61,0.22)' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        label: ['var(--font-label)', 'Space Grotesk', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', pill: '100px' },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        floatY: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(28px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        floatY: 'floatY 7s ease-in-out infinite',
        pulseRing: 'pulseRing 2s cubic-bezier(0.215,0.61,0.355,1) infinite',
        shimmer: 'shimmer 3s linear infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
      },
    },
  },
  plugins: [],
};
export default config;
