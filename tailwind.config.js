/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#F5F5F7',
          card: 'rgba(255, 255, 255, 0.8)',
          darkCard: 'rgba(22, 22, 23, 0.8)',
          border: 'rgba(0, 0, 0, 0.08)',
          darkBorder: 'rgba(255, 255, 255, 0.12)',
          text: '#1D1D1F',
          secondary: '#86868B',
          tertiary: '#6E6E73',
          blue: '#0071E3',
          blueHover: '#0077ED',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
        },
        sky: {
          DEFAULT: '#0071E3',
          bright: '#2997FF',
          deep: '#0047AB',
          soft: '#E8F2FF',
          50: '#F5F9FF',
          100: '#E8F2FF',
          200: '#C7E0FF',
          500: '#0071E3',
          600: '#0077ED',
          700: '#0047AB',
        },
        sun: {
          DEFAULT: '#FF9500',
          bright: '#FFB340',
          deep: '#D97706',
          soft: '#FFF5E5',
        },
        leaf: {
          DEFAULT: '#34C759',
          soft: '#EBF9EE',
          deep: '#28A745',
        },
        coral: {
          DEFAULT: '#FF3B30',
          soft: '#FFECEB',
          deep: '#D70015',
        },
        berry: {
          DEFAULT: '#AF52DE',
          soft: '#F6EDFC',
          deep: '#8944AB',
        },
        ink: {
          DEFAULT: '#1D1D1F',
          muted: '#6E6E73',
          subtle: '#86868B',
          faint: '#D2D2D7',
        },
        surface: {
          DEFAULT: '#F5F5F7',
          elevated: '#FFFFFF',
          sunken: '#E8E8ED',
        },
        outline: {
          DEFAULT: '#D2D2D7',
          strong: '#86868B',
        }
      },
      borderRadius: {
        'sk-sm': '10px',
        'sk-btn': '980px', // Apple iconic pill capsule buttons
        'sk-card': '24px', // Apple squircle rounded cards
        'sk-modal': '28px',
        'apple-pill': '980px',
        'apple-card': '24px',
      },
      boxShadow: {
        'sk-card': '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'sk-active': '0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'sk-modal': '0 30px 60px rgba(0, 0, 0, 0.15)',
        'sk-sun-glow': '0 0 24px rgba(255, 149, 0, 0.3)',
        'apple-glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'apple-hover': '0 12px 30px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
        reading: ['-apple-system', '"SF Pro Text"', 'Inter', 'serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'apple-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }
    },
  },
  plugins: [],
}
