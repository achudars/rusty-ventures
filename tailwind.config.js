/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New color palette from the attachment
        "dark-burgundy": "#800020",
        "steel-blue": "#4682B4",
        "light-blue": "#87CEEB",
        "pale-blue": "#B0E0E6",
        "very-light-blue": "#F0F8FF",

        // Keep pride colors for legacy compatibility
        "pride-purple": "#a12a72",
        "pride-red": "#ee3356",
        "pride-orange": "#f77e55",
        "pride-yellow": "#f9d35e",
        "pride-teal": "#2a9d8f",
      },
    },
  },
  plugins: [],
};
