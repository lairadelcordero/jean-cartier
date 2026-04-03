const DEFAULT_SITE_URL = "https://jeancartier.ar";

/**
 * `new URL()` exige protocolo. Valores tipo `jeancartier.ar` o `localhost:777` rompen
 * `metadataBase` en layout y devuelven HTTP 500 sin mensaje claro en el navegador.
 */
function normalizeSiteOrigin(raw: string): string {
  const t = raw.trim().replace(/\/$/, "");
  if (!t) return DEFAULT_SITE_URL;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

/** Canonical origin for SEO, Open Graph and JSON-LD (no trailing slash). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return normalizeSiteOrigin(raw);
}

export const siteConfig = {
  name: "Jean Cartier",
  legalName: "Jean Cartier Herencia SRL",
  titleTemplate: "%s | Jean Cartier",
  defaultTitle: "Jean Cartier – Plataforma de Licencias & Marketplace",
  description:
    "Plataforma oficial de Jean Cartier Herencia SRL: licencias, marketplace y herencia de marca en Argentina. Operación segura con tecnología de punta.",
  /** Primary keywords for metadata; refine with content strategy. */
  keywords: [
    "Jean Cartier",
    "Jean Cartier Herencia",
    "licencias de marca",
    "marketplace Jean Cartier",
    "marca Argentina",
    "plataforma oficial Jean Cartier",
    "jeancartier.ar",
  ],
  locale: "es_AR",
  language: "es-AR",
  twitterHandle: undefined as string | undefined,
} as const;

export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
