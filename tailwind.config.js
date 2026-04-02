/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2E86AB",
        secondary: "#A23B72",
        accent: "#F18F01",
        background: "#F8F9FA",
        card: "#FFFFFF",
        text: "#333333",
        textLight: "#666666",
        textGray: "#999999",
        border: "#E0E0E0",
        error: "#DC3545",
        success: "#28A745",
        warning: "#FFC107",
        info: "#17A2B8",
      },
    },
  },
  plugins: [],
};
