/** @type {import('tailwindcss').Config} */
const configure = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandBlue: "#1E60AA", // fixify colour theme dark blue
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "scrollbar-width": "none" /*for Firefox */,
          "-ms-overflow-style": "none" /*for IE 10+ */,
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none" /*for WebKit browsers */,
        },
      });
    },
  ],
};
export default configure;
