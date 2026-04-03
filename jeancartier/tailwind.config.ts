import type { Config } from "tailwindcss";

/**
 * Tipografía: Fustat variable (next/font → --font-sans). Pesos vía CSS: --fustat-wght-* en globals.css.
 * Color: blanco, negro, 6 grises fríos y gradientes (jc.*).
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jc: {
          white: "#ffffff",
          /** Negro suave (texto principal) */
          black: "#0c0d0e",
          /** 6 grises, claros tirando a frío (slate) */
          g1: "#f4f7fb",
          g2: "#e6ecf4",
          g3: "#cdd6e3",
          g4: "#94a0b0",
          g5: "#5f6b78",
          g6: "#2e343c",
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
        body: ["1rem", { lineHeight: "1.5rem" }],
        lead: ["1.125rem", { lineHeight: "1.65rem" }],
        "title-sm": ["1.125rem", { lineHeight: "1.35rem", letterSpacing: "-0.01em" }],
        "title-md": ["1.375rem", { lineHeight: "1.3rem", letterSpacing: "-0.015em" }],
        "title-lg": ["1.75rem", { lineHeight: "1.25rem", letterSpacing: "-0.02em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      },
      letterSpacing: {
        menu: "0.06em",
        ribbon: "0.08em",
      },
      backgroundImage: {
        /** Fondo general: bruma gris-azulada */
        "gradient-page": "linear-gradient(168deg, #f6f8fc 0%, #eef2f9 42%, #e3eaf3 100%)",
        /** Variante más suave (hero / secciones) */
        "gradient-mist": "linear-gradient(180deg, #fafbfd 0%, #f2f5fa 55%, #e9eff6 100%)",
        /** Sutil radial + degradado (profundidad) */
        "gradient-soft":
          "radial-gradient(ellipse 100% 60% at 50% -15%, rgba(227, 235, 245, 0.9) 0%, transparent 50%), linear-gradient(180deg, #f8fafc 0%, #eef2f8 100%)",
        /** Panel / tarjeta sobre fondo */
        "gradient-surface": "linear-gradient(145deg, #ffffff 0%, #f7f9fc 100%)",
      },
      boxShadow: {
        jc: "0 1px 2px rgba(14, 22, 35, 0.06), 0 4px 16px rgba(14, 22, 35, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
