/** @type {import('tailwindcss').Config} */
const configure = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brandBlue: "#1E60AA", // fixify colour theme dark blue
                customBlue: "rgba(230, 238, 244, 0.50)",
                customBlueHover: "rgba(230, 238, 244, 0.60)",
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
                ".arrow-hide": {
                    "&::-webkit-inner-spin-button": {
                        "-webkit-appearance": "none",
                        margin: 0,
                    },
                    "&::-webkit-outer-spin-button": {
                        "-webkit-appearance": "none",
                        margin: 0,
                    },
                },
            });
        },
    ],
};
export default configure;
