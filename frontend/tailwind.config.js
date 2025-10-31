import forms from '@tailwindcss/forms';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Vazirmatn"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        surface: 'rgb(var(--app-surface) / <alpha-value>)',
        primary: 'rgb(var(--app-primary) / <alpha-value>)',
        accent: 'rgb(var(--app-accent) / <alpha-value>)'
      }
    }
  },
  plugins: [forms]
};
