import type { Config } from "tailwindcss";

/**
 * Sistema visual tipo grandes almacenes (referencia: elcorteingles.es):
 * - Una sola familia sans para UI, menús y titulares (peso y tracking marcan jerarquía).
 * - Menús / rúbricas: pequeño, mayúsculas, tracking amplio, semibold.
 * - Cuerpo: 16px, interlineado cómodo.
 * - H1–H3: pesos 600–700, display con interlineado ajustado.
 * Colores adaptados a Jean Cartier (no verde ECI).
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
        primary: "#1a1a2e",
        accent: "#c9a84c",
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
      fontSize: {
        /** Rúbricas tipo “sección” en mega-menú / pies (11px, tracking). */
        nav: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        /** Texto de menú principal y categorías (13px). */
        menu: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0.06em" }],
        /** Cuerpo estándar retail (16px). */
        body: ["1rem", { lineHeight: "1.5rem" }],
        /** Entradilla / destacados. */
        lead: ["1.125rem", { lineHeight: "1.65rem" }],
        /** H3, fichas, subtítulos. */
        "title-sm": ["1.125rem", { lineHeight: "1.35rem", letterSpacing: "-0.01em" }],
        /** H2 de bloque. */
        "title-md": ["1.375rem", { lineHeight: "1.3rem", letterSpacing: "-0.015em" }],
        /** H2 hero secundario. */
        "title-lg": ["1.75rem", { lineHeight: "1.25rem", letterSpacing: "-0.02em" }],
        /** H1 mobile / display compacto. */
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        /** H1 desktop. */
        "display-lg": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      },
      letterSpacing: {
        /** Menús y etiquetas en mayúsculas (estilo catálogo). */
        menu: "0.06em",
        ribbon: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
