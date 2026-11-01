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
        cocogoose: ["var(--font-cocogoose)", "sans-serif"],
        body: ["var(--font-cocogoose-light)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          yellow: "#FFE66D",
          amber: "#F4B400",
          pink: "#FFB5C5",
          hotpink: "#FF5376",
          red: "#E52320",
          blue: "#238BE6",
          lightblue: "#90CAF9",
          green: "#2EA35C",
          lightgreen: "#B9F6CA",
          purple: "#D6C7FF",
          dark: "#141414",
          card: "#FFFFFF",
          clipboard: "#DFB277",
          paper: "#FFFDF9",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #141414",
        "brutal-sm": "2px 2px 0px 0px #141414",
        "brutal-lg": "6px 6px 0px 0px #141414",
        "brutal-xl": "8px 8px 0px 0px #141414",
        "brutal-hover": "2px 2px 0px 0px #141414",
      },
      borderRadius: {
        brutal: "12px",
      },
    },
  },
  plugins: [],
};

export default config;

