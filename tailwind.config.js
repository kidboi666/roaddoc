/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4A90D9",
        success: "#4CAF50",
        error: "#F44336",
        background: {
          light: "#f5f5f5",
          dark: "#121212",
        },
        card: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
        text: {
          light: "#1a1a1a",
          dark: "#f5f5f5",
        },
        "text-secondary": {
          light: "#666666",
          dark: "#a0a0a0",
        },
      },
    },
  },
  plugins: [],
};
