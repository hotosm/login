/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "var(--hot-spacing-large)",
        sm: "var(--hot-spacing-large)",
        md: "var(--hot-spacing-2x-large)",
        lg: "var(--hot-spacing-3x-large)",
        xl: "var(--hot-spacing-4x-large)",
      },
    },
    extend: {
      colors: {
        // Primary colors (red scale)
        "hot-red-950": "var(--hot-color-red-950)",
        "hot-red-900": "var(--hot-color-red-900)",
        "hot-red-800": "var(--hot-color-red-800)",
        "hot-red-700": "var(--hot-color-red-700)",
        "hot-red-600": "var(--hot-color-red-600)",
        "hot-red-500": "var(--hot-color-red-500)",
        "hot-red-400": "var(--hot-color-red-400)",
        "hot-red-300": "var(--hot-color-red-300)",
        "hot-red-200": "var(--hot-color-red-200)",
        "hot-red-100": "var(--hot-color-red-100)",
        "hot-red-50": "var(--hot-color-red-50)",

        // Rose scale
        "hot-rose-950": "var(--hot-color-rose-950)",
        "hot-rose-900": "var(--hot-color-rose-900)",
        "hot-rose-800": "var(--hot-color-rose-800)",
        "hot-rose-700": "var(--hot-color-rose-700)",
        "hot-rose-600": "var(--hot-color-rose-600)",
        "hot-rose-500": "var(--hot-color-rose-500)",
        "hot-rose-400": "var(--hot-color-rose-400)",
        "hot-rose-300": "var(--hot-color-rose-300)",
        "hot-rose-200": "var(--hot-color-rose-200)",
        "hot-rose-100": "var(--hot-color-rose-100)",
        "hot-rose-50": "var(--hot-color-rose-50)",

        // Yellow scale
        "hot-yellow-950": "var(--hot-color-yellow-950)",
        "hot-yellow-900": "var(--hot-color-yellow-900)",
        "hot-yellow-800": "var(--hot-color-yellow-800)",
        "hot-yellow-700": "var(--hot-color-yellow-700)",
        "hot-yellow-600": "var(--hot-color-yellow-600)",
        "hot-yellow-500": "var(--hot-color-yellow-500)",
        "hot-yellow-400": "var(--hot-color-yellow-400)",
        "hot-yellow-300": "var(--hot-color-yellow-300)",
        "hot-yellow-200": "var(--hot-color-yellow-200)",
        "hot-yellow-100": "var(--hot-color-yellow-100)",
        "hot-yellow-50": "var(--hot-color-yellow-50)",

        // Blue scale
        "hot-blue-950": "var(--hot-color-blue-950)",
        "hot-blue-900": "var(--hot-color-blue-900)",
        "hot-blue-800": "var(--hot-color-blue-800)",
        "hot-blue-700": "var(--hot-color-blue-700)",
        "hot-blue-600": "var(--hot-color-blue-600)",
        "hot-blue-500": "var(--hot-color-blue-500)",
        "hot-blue-400": "var(--hot-color-blue-400)",
        "hot-blue-300": "var(--hot-color-blue-300)",
        "hot-blue-200": "var(--hot-color-blue-200)",
        "hot-blue-100": "var(--hot-color-blue-100)",
        "hot-blue-50": "var(--hot-color-blue-50)",

        // Cyan scale
        "hot-cyan-950": "var(--hot-color-cyan-950)",
        "hot-cyan-900": "var(--hot-color-cyan-900)",
        "hot-cyan-800": "var(--hot-color-cyan-800)",
        "hot-cyan-700": "var(--hot-color-cyan-700)",
        "hot-cyan-600": "var(--hot-color-cyan-600)",
        "hot-cyan-500": "var(--hot-color-cyan-500)",
        "hot-cyan-400": "var(--hot-color-cyan-400)",
        "hot-cyan-300": "var(--hot-color-cyan-300)",
        "hot-cyan-200": "var(--hot-color-cyan-200)",
        "hot-cyan-100": "var(--hot-color-cyan-100)",
        "hot-cyan-50": "var(--hot-color-cyan-50)",

        // Success scale (green)
        "hot-success-950": "var(--hot-color-success-950)",
        "hot-success-900": "var(--hot-color-success-900)",
        "hot-success-800": "var(--hot-color-success-800)",
        "hot-success-700": "var(--hot-color-success-700)",
        "hot-success-600": "var(--hot-color-success-600)",
        "hot-success-500": "var(--hot-color-success-500)",
        "hot-success-400": "var(--hot-color-success-400)",
        "hot-success-300": "var(--hot-color-success-300)",
        "hot-success-200": "var(--hot-color-success-200)",
        "hot-success-100": "var(--hot-color-success-100)",
        "hot-success-50": "var(--hot-color-success-50)",

        // Grays
        "hot-gray-1000": "var(--hot-color-gray-1000)",
        "hot-gray-950": "var(--hot-color-gray-950)",
        "hot-gray-900": "var(--hot-color-gray-900)",
        "hot-gray-800": "var(--hot-color-gray-800)",
        "hot-gray-700": "var(--hot-color-gray-700)",
        "hot-gray-600": "var(--hot-color-gray-600)",
        "hot-gray-500": "var(--hot-color-gray-500)",
        "hot-gray-400": "var(--hot-color-gray-400)",
        "hot-gray-300": "var(--hot-color-gray-300)",
        "hot-gray-200": "var(--hot-color-gray-200)",
        "hot-gray-100": "var(--hot-color-gray-100)",
        "hot-gray-50": "var(--hot-color-gray-50)",

        // Semantic colors
        "hot-primary": "var(--hot-color-primary-600)",
        "hot-danger": "var(--hot-color-danger-600)",
        "hot-success": "var(--hot-color-success-600)",
        "hot-warning": "var(--hot-color-warning-600)",
        "hot-neutral": "var(--hot-color-neutral-500)",
      },

      // HOT Official Typography
      fontFamily: {
        sans: ["var(--hot-font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--hot-font-mono)", "ui-monospace", "monospace"],
      },

      fontSize: {
        "2xs": "var(--hot-font-size-2x-small)",
        xs: "var(--hot-font-size-x-small)",
        sm: "var(--hot-font-size-small)",
        base: "var(--hot-font-size-medium)",
        lg: "var(--hot-font-size-large)",
        xl: "var(--hot-font-size-x-large)",
        "2xl": "var(--hot-font-size-2x-large)",
        "3xl": "var(--hot-font-size-3x-large)",
        "4xl": "var(--hot-font-size-4x-large)",
      },

      fontWeight: {
        light: "var(--hot-font-weight-light)",
        normal: "var(--hot-font-weight-normal)",
        semibold: "var(--hot-font-weight-semibold)",
        bold: "var(--hot-font-weight-bold)",
      },

      // HOT Official Spacing
      spacing: {
        "3xs": "var(--hot-spacing-3x-small)",
        "2xs": "var(--hot-spacing-2x-small)",
        xs: "var(--hot-spacing-x-small)",
        sm: "var(--hot-spacing-small)",
        md: "var(--hot-spacing-medium)",
        lg: "var(--hot-spacing-large)",
        xl: "var(--hot-spacing-x-large)",
        "2xl": "var(--hot-spacing-2x-large)",
        "3xl": "var(--hot-spacing-3x-large)",
        "4xl": "var(--hot-spacing-4x-large)",
      },

      // HOT Official Border Radius
      borderRadius: {
        sm: "var(--hot-border-radius-small)",
        md: "var(--hot-border-radius-medium)",
        lg: "var(--hot-border-radius-large)",
        xl: "var(--hot-border-radius-x-large)",
        "2xl": "var(--hot-border-radius-2x-large)",
        full: "var(--hot-border-radius-circle)",
        pill: "var(--hot-border-radius-pill)",
      },

      // Custom animations
      keyframes: {
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};
