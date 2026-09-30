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
        apple: {
          bg: "#f5f5f7",
          panel: "rgba(255, 255, 255, 0.4)",
          border: "rgba(255, 255, 255, 0.6)",
          blue: "#0071e3",
          dark: "#1d1d1f",
          gray: "#86868b",
        }
      }
    },
  },
  plugins: [],
};
