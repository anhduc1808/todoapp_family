/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'light-bg': '#F9FAFB',
        'light-card': '#FFFFFF',
        'accent-light': '#F4511E',
        'text-primary-light': '#111827',
        'text-secondary-light': '#6B7280',
        'border-light': '#E5E7EB',
        // Dark mode colors
        'dark-bg': '#111827',
        'dark-card': '#1F2937',
        'accent-dark': '#FF8A65',
        'text-primary-dark': '#F9FAFB',
        'text-secondary-dark': '#9CA3AF',
        'border-dark': '#374151',
      },
    },
  },
  plugins: [],
}
