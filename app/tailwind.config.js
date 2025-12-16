/** @type {import('tailwindcss').Config} */
/**
 * Tailwind CSS Configuration - DLS Integration
 * 
 * This config maps all Design Language System (DLS) tokens to Tailwind utilities.
 * DLS tokens are the single source of truth for all design values.
 * 
 * Architecture:
 * - Base color tokens (neutral, blue, purple, etc.) are mapped directly
 * - Semantic colors (theme-aware) use CSS variables for dynamic theming
 * - Spacing, typography, radii, and shadows map directly to DLS tokens
 */

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './ui/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // ============================================
      // SPACING - Maps to spacingTokens
      // ============================================
      spacing: {
        0: '0px',
        1: '4px',   // xs - tight spacing
        2: '8px',   // sm - compact spacing
        3: '12px',  // md - comfortable spacing
        4: '16px',  // lg - relaxed spacing
        5: '24px',  // xl - spacious
        6: '32px',  // 2xl - very spacious
        7: '40px',  // 3xl - generous
        8: '48px',  // 4xl - large gaps
        9: '64px',  // 5xl - section dividers
        10: '80px', // 6xl - hero spacing
        12: '96px', // 7xl - mega spacing
      },

      // ============================================
      // BORDER RADIUS - Maps to radiusTokens
      // ============================================
      borderRadius: {
        none: '0px',
        sm: '6px',   // Small elements (badges, tags)
        md: '8px',   // Buttons, inputs
        lg: '12px',  // Cards, panels
        xl: '16px',  // Modals, drawers
        '2xl': '20px', // Hero cards
        full: '9999px', // Circular avatars
      },

      // ============================================
      // TYPOGRAPHY - Maps to typographyTokens
      // ============================================
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
      fontFamily: {
        // Display & Headings - Outfit
        display: ['Outfit_700Bold', 'system-ui', 'sans-serif'],
        'display-medium': ['Outfit_600SemiBold', 'system-ui', 'sans-serif'],
        'display-light': ['Outfit_500Medium', 'system-ui', 'sans-serif'],
        // Body & UI - Inter
        primary: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        'primary-medium': ['Inter_500Medium', 'system-ui', 'sans-serif'],
        'primary-semibold': ['Inter_600SemiBold', 'system-ui', 'sans-serif'],
        'primary-bold': ['Inter_700Bold', 'system-ui', 'sans-serif'],
        // Code & Notation - JetBrains Mono
        mono: ['JetBrainsMono_400Regular', 'monospace'],
        'mono-medium': ['JetBrainsMono_500Medium', 'monospace'],
        'mono-bold': ['JetBrainsMono_700Bold', 'monospace'],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },
      letterSpacing: {
        tight: '-0.5px',
        normal: '0px',
        wide: '0.5px',
        wider: '1px',
      },

      // ============================================
      // COLORS - Maps to colorTokens and semanticColors
      // ============================================
      colors: {
        // Base color palettes from DLS colorTokens
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        blue: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        purple: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        green: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FEC2C2',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#6F3007',
        },
        cyan: {
          50: '#F0F9FB',
          100: '#D8F3F5',
          200: '#B0E6EA',
          300: '#88DADF',
          400: '#60CDD4',
          500: '#38BCC6',
          600: '#06B6D4',
          700: '#0891B2',
          800: '#0E7490',
          900: '#164E63',
        },
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        
        // Semantic colors (theme-aware via CSS variables)
        // These are set dynamically by ThemeProvider
        background: {
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
          card: 'var(--color-background-card)',
          elevated: 'var(--color-background-elevated)',
          accentSubtle: 'var(--color-background-accentSubtle)',
        },
        foreground: {
          primary: 'var(--color-foreground-primary)',
          secondary: 'var(--color-foreground-secondary)',
          tertiary: 'var(--color-foreground-tertiary)',
          muted: 'var(--color-foreground-muted)',
          onAccent: 'var(--color-foreground-onAccent)',
        },
        accent: {
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
        },
        accentForeground: {
          primary: 'var(--color-accentForeground-primary)',
          secondary: 'var(--color-accentForeground-secondary)',
        },
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        interactive: {
          default: 'var(--color-interactive-default)',
          hover: 'var(--color-interactive-hover)',
          active: 'var(--color-interactive-active)',
          disabled: 'var(--color-interactive-disabled)',
        },
        border: 'var(--color-border)',
        overlay: 'var(--color-overlay)',
        translucent: {
          light: 'var(--color-translucent-light)',
          medium: 'var(--color-translucent-medium)',
          dark: 'var(--color-translucent-dark)',
        },
      },

      // ============================================
      // SHADOWS - Maps to shadowTokens
      // ============================================
      boxShadow: {
        none: 'none',
        // Size-based shadows
        xs: '0 1px 1px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.12)',
        // Glow effects (AI Aesthetic)
        'glow-sm': '0 0 8px rgba(251, 146, 60, 0.4)',
        'glow-md': '0 0 16px rgba(251, 146, 60, 0.5)',
        'glow-lg': '0 0 24px rgba(234, 88, 12, 0.6)',
        // Semantic shadows
        card: '0 1px 8px rgba(0, 0, 0, 0.05)',
        panel: '0 2px 12px rgba(0, 0, 0, 0.06)',
        floating: '0 4px 16px rgba(0, 0, 0, 0.08)',
        hover: '0 2px 10px rgba(0, 0, 0, 0.08)',
        modal: '0 24px 48px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};
