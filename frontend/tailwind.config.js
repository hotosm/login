/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "2rem",
        lg: "3rem",
        xl: "4rem",
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
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};
