/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customBlue: "#1E40AF",
        brandGreen: {
          light: "#6EE7B7",
          DEFAULT: "#10B981",
          dark: "#047857",
        },
        // borderGray: "#E5E7EB",
        borderGray: "#eee",
        lightGray: "#F5F7F9",
        mediumGray: "#999AA3",
        darkGray: "#4D4E55",
        gray4: "#F9FBFC",
      },
      maxWidth: {
        70: "70rem",
      },
    },
    plugins: [],
  },
};
