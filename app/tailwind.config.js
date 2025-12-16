/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './ui/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Map DLS spacing tokens to Tailwind spacing
      spacing: {
        0: '0px',
        1: '4px',   // xs
        2: '8px',   // sm
        3: '12px',  // md
        4: '16px',  // lg
        5: '24px',  // xl
        6: '32px',  // 2xl
        7: '40px',  // 3xl
        8: '48px',  // 4xl
        9: '64px',  // 5xl
        10: '80px', // 6xl
        12: '96px', // 7xl
      },
      // Map DLS radius tokens to Tailwind borderRadius
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      // Map DLS typography to Tailwind font sizes
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.4' }],
        xl: ['20px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
        '4xl': ['32px', { lineHeight: '1.2' }],
      },
      // Colors will be handled dynamically via theme context
      // We'll use arbitrary values for colors since they're theme-aware
      colors: {
        // These are fallback colors - actual colors come from theme context
        accent: {
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
        },
      },
    },
  },
  plugins: [],
};
