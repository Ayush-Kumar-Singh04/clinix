import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        cream: {
          DEFAULT: "#FAF6F1",
          dark: "#F0EBE3",
        },
        brand: {
          50: "#FEF9EF",
          100: "#FDF3DC",
          200: "#F5CC74",
          300: "#F0BA52",
          400: "#ECAD3A",
          500: "#E8A838",
          600: "#D49730",
          700: "#92600A",
          800: "#6B4200",
          900: "#4A2E00",
          950: "#2C1810",
        },
        warm: {
          50: "#F5F0E8",
          100: "#EDE4D8",
          200: "#D9C9B4",
          300: "#C4A882",
          400: "#A07850",
          500: "#8B6914",
          600: "#6B4F3A",
          700: "#5C4033",
          800: "#3D2B1F",
          900: "#2C1810",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
