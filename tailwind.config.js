/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "nunito": ["Nunito", "sans-serif"],
        "madimi": ["Madimi One", "sans-serif"]
      },
      colors: {
        "primary": "#5345f5"
      }
    },
  },
  plugins: [],
}

