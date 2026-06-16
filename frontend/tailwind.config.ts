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
          bg: "#0B0D12",
          panel: "#141821",
          tile: "#1E2430",
          border: "#2A3242",
          text: "#F4F7FB",
          muted: "#8B95A7",
          accent: "#6366F1",
          accent2: "#22D3EE",
          accent3: "#EC4899",
          success: "#22C55E",
          danger: "#EF4444"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"]
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.4)", opacity: "0.4" },
          "60%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.85)" }
        },
        "glow-drift": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(40px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-30px, 20px) scale(0.95)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        }
      },
      animation: {
        pop: "pop 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.5s ease-out both",
        "gradient-pan": "gradient-pan 6s ease infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "glow-drift": "glow-drift 18s ease-in-out infinite"
      }
    }
  },
  plugins: [],
};
export default config;
