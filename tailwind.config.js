/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#0f172a",
        surfaceBorder: "#1e293b",
        cyberEmerald: "#10b981",
        cyberCyan: "#06b6d4",
        cyberPurple: "#a855f7",
        cyberRose: "#f43f5e",
      },
    },
  },
  plugins: [],
};
