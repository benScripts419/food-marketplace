/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        black: "#000000",

        primary: "#E53935",
        primaryDark: "#C62828",

        background: "#FAFAFA",

        text: "#171717",
        textSecondary: "#737373",

        border: "#E5E5E5",
        surface: "#F2F2F2",

        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
      },
    },
  },

  plugins: [],
};
