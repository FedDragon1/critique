/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        "primary": "var(--color-primary)",
        "accent": "var(--color-accent)",
        "primary-translucent": "var(--color-primary-translucent)",
        "foreground": "var(--foreground)",
        "background": "var(--background)",
      },
      height: {
        "nav": "var(--nav-height)"
      }
    },
  },
  plugins: [],
}

