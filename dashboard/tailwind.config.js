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
        brandMaroon: "#9c110d",
        brandTeal: "#1e556d",
        brandPurple: "#5b35a952",
        brandDarkPurple: "#301a64",
        brandOrange: "#f16a2852",
        brandDarkOrange: "#8b3f18",
        brandRed: "#fc3a4f52",
        brandDarkRed: "#941a26",
        muted: "#A3A3C2",
      },
      maxWidth: {
        70: "70rem",
      },
      flex: {
        2: "2 2 0%",
        3: "3 3 0%",
        4: "4 4 0%",
        5: "5 5 0%",
      },
    },
    plugins: [],
  },
};
