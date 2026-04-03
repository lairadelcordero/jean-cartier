import type { Config } from "tailwindcss";

/**
 * Tokens alineados al manual de marca (Figma Make → theme.css):
 * Jean Cartier — grises 50–900, negro/blanco, oro C9A961; Fustat + Inter; radio base 4px.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        brand: "0.25rem",
      },
      colors: {
        jc: {
          black: "#000000",
          white: "#FFFFFF",
          "gray-50": "#F5F5F5",
          "gray-100": "#E5E5E5",
          "gray-300": "#B0B0B0",
          "gray-500": "#7A7A7A",
          "gray-700": "#4A4A4A",
          "gray-900": "#1A1A1A",
          gold: "#C9A961",
          "gold-light": "#E8D5A8",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontWeight: {
        body: "var(--fustat-wght-body)",
        emphasis: "var(--fustat-wght-emphasis)",
        heading: "var(--fustat-wght-heading)",
        display: "var(--fustat-wght-display)",
      },
      fontSize: {
        nav: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        menu: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0.06em" }],
        body: ["1rem", { lineHeight: "1.6" }],
        lead: ["1.125rem", { lineHeight: "1.65rem" }],
        "title-sm": ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "title-md": ["1.75rem", { lineHeight: "1.4" }],
        "title-lg": ["2.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        menu: "0.06em",
        ribbon: "0.08em",
      },
      backgroundImage: {
        "gradient-page": "linear-gradient(168deg, #FAFAFA 0%, #F5F5F5 45%, #EEEEEE 100%)",
        "gradient-mist": "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 55%, #EBEBEB 100%)",
        "gradient-soft":
          "radial-gradient(ellipse 100% 55% at 50% -12%, rgba(201, 169, 97, 0.06) 0%, transparent 45%), linear-gradient(180deg, #FDFDFD 0%, #F2F2F2 100%)",
        "gradient-surface": "linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)",
      },
      boxShadow: {
        jc: "0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 14px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
