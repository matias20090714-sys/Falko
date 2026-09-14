import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        falko: {
          50: "#f0fdf9",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#00f2fe", // Electric Falcon Cyan
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0b132b", // Deep Tech Slate
          950: "#050814",
        },
        falcon: {
          gold: "#f59e0b",
          emerald: "#10b981",
          accent: "#00f2fe",
          dark: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(0, 242, 254, 0.25)',
        'glow-lg': '0 0 40px -5px rgba(0, 242, 254, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
