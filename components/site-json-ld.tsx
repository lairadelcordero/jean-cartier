import { getAbsoluteUrl, getSiteUrl, siteConfig } from "@/lib/site-config";

/** Organization + WebSite structured data for Google Rich Results. */
export function SiteJsonLd() {
  const url = getSiteUrl();
  const logoUrl = getAbsoluteUrl("/images/brand/jc-monogram.png");

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 512,
      height: 512,
      caption: "Monograma Jean Cartier – identidad de marca",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: siteConfig.defaultTitle,
    description: siteConfig.description,
    url,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${url}/#organization` },
    potentialAction: {
      "@type": "ReadAction",
      target: url,
    },
  };

  const graph = [organization, website];

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD graph, not user-controlled HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
