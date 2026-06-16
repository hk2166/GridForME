import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  extend: {
    colors: {
      gridwars: {
        bg: "#0F1115",
        panel: "#171A21",
        tile: "#2D2D2D",
        border: "#303642",
        text: "#F4F7FB",
        muted: "#9AA4B2",
        accent: "#22C55E",
        danger: "#EF4444"
      }
    },
    fontFamily: {
      sans: ["var(--font-inter)", "sans-serif"],
      display: ["var(--font-space-grotesk)", "sans-serif"],
      mono: ["var(--font-jetbrains-mono)", "monospace"]
    }
  }
},
  plugins: [],
};
export default config;
