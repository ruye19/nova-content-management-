/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          ink: "#0f172a",
          fog: "#94a3b8",
          accent: "#f97316",
          highlight: "#38bdf8",
        },
      },
      boxShadow: {
        glass: "0 10px 50px rgba(15, 23, 42, 0.15)",
      },
    },
  },
  plugins: [],
};
