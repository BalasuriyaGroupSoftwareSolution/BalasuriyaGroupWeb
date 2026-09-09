/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1E3F",
          steel: "#1E3A6E",
          accent: "#4A6FA5",
          surface: "#F4F6F9",
          gold: "#F5A623",
        },
      },
      fontFamily: {
        display: ["Poppins", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        blob: "blob 12s infinite ease-in-out",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.95)" },
        },
      },
    },
  },
  plugins: [],
};
