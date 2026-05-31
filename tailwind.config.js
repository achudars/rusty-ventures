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
        base: "#0a0a0a",
        surface: "#111111",
        elevated: "#1a1a1a",
        code: "#141414",
        console: "#0d0d0d",
        accent: "#e07b39",
        "accent-hover": "#f08c50",
        success: "#4ade80",
        error: "#f87171",
        "text-primary": "#ebebeb",
        "text-secondary": "#808080",
        "text-muted": "#484848",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Cascadia Code", "monospace"],
      },
    },
  },
  plugins: [],
};
