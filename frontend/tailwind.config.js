/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta ocre / azul (minería peruana)
        ocre: {
          50: "#faf6ef",
          100: "#f3e9d6",
          200: "#e7d1ac",
          300: "#d8b47a",
          400: "#cc9a54",
          500: "#c2853d",
          600: "#a96b32",
          700: "#87512b",
          800: "#6f4229",
          900: "#5c3824",
        },
        pacifico: {
          50: "#eef7fb",
          100: "#d5eaf3",
          200: "#a9d5e7",
          300: "#74b9d5",
          400: "#4098bd",
          500: "#2e8b9e",
          600: "#256a7c",
          700: "#215666",
          800: "#204955",
          900: "#1e3e49",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
