/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SOC-style dark theme palette
        'soc-bg': '#0a0a0f',
        'soc-surface': '#12121a',
        'soc-border': '#1e1e2e',
        'soc-text': '#e4e4e7',
        'soc-muted': '#71717a',
        'soc-accent': '#3b82f6',
        'soc-danger': '#ef4444',
        'soc-warning': '#f59e0b',
        'soc-success': '#22c55e',
      },
    },
  },
  plugins: [],
}
