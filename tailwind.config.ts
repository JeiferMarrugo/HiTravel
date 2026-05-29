import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f9fb",
        primary: "#001e40",
        "primary-container": "#003366",
        secondary: "#745b00",
        "secondary-container": "#fecb00",
        tertiary: "#002131",
        "tertiary-container": "#00374f",
        surface: "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-variant": "#e0e3e5",
        outline: "#737780",
        "outline-variant": "#c3c6d1",
        "on-surface": "#191c1e",
        "on-surface-variant": "#43474f",
        "on-primary": "#ffffff",
        "on-secondary-container": "#6e5700",
        "on-tertiary-container": "#00a6e4",
      },
      boxShadow: {
        coastal: "0 10px 30px -5px rgba(0, 51, 102, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "sans-serif"],
      },
      maxWidth: {
        shell: "80rem",
      },
    },
  },
  plugins: [],
};

export default config;
