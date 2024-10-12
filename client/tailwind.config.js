/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Blue shade
        secondary: "#F3F4F6", // Light Gray
        accent: "#10B981", // Green shade
        danger: "#EF4444", // Red shade
        background: "#FFFFFF", // White
        dark: "#111827", // Dark Gray
      },
    },
  },
  plugins: [],
};
