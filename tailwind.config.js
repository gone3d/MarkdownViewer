/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      colors: {
        // Custom color palette for markdown viewer
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Editor specific colors
        editor: {
          bg: '#1e1e1e',
          'bg-light': '#ffffff',
          gutter: '#2d2d2d',
          'gutter-light': '#f5f5f5',
          selection: '#264f78',
          'selection-light': '#add6ff',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'rgb(55 65 81)',
            '.dark &': {
              color: 'rgb(209 213 219)',
            },
            h1: {
              color: 'rgb(17 24 39)',
              '.dark &': {
                color: 'rgb(249 250 251)',
              },
            },
            h2: {
              color: 'rgb(17 24 39)',
              '.dark &': {
                color: 'rgb(249 250 251)',
              },
            },
            h3: {
              color: 'rgb(17 24 39)',
              '.dark &': {
                color: 'rgb(249 250 251)',
              },
            },
            h4: {
              color: 'rgb(17 24 39)',
              '.dark &': {
                color: 'rgb(249 250 251)',
              },
            },
            code: {
              backgroundColor: 'rgb(243 244 246)',
              color: 'rgb(220 38 127)',
              fontWeight: '500',
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
              '.dark &': {
                backgroundColor: 'rgb(31 41 55)',
                color: 'rgb(251 113 133)',
              },
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            pre: {
              backgroundColor: 'rgb(31 41 55)',
              color: 'rgb(229 231 235)',
              ':not(.dark) &': {
                backgroundColor: 'rgb(249 250 251)',
                color: 'rgb(55 65 81)',
              },
            },
            blockquote: {
              borderLeftColor: 'rgb(59 130 246)',
              color: 'rgb(75 85 99)',
              '.dark &': {
                color: 'rgb(156 163 175)',
              },
            },
            a: {
              color: 'rgb(59 130 246)',
              '&:hover': {
                color: 'rgb(29 78 216)',
              },
              '.dark &': {
                color: 'rgb(96 165 250)',
                '&:hover': {
                  color: 'rgb(147 197 253)',
                },
              },
            },
            table: {
              fontSize: '0.875rem',
            },
            'th, td': {
              borderColor: 'rgb(209 213 219)',
              '.dark &': {
                borderColor: 'rgb(75 85 99)',
              },
            },
            th: {
              backgroundColor: 'rgb(249 250 251)',
              '.dark &': {
                backgroundColor: 'rgb(31 41 55)',
              },
            },
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
