import { SiteJsonLd } from "@/components/site-json-ld";
import { getAbsoluteUrl, getSiteUrl, siteConfig } from "@/lib/site-config";
import type { Metadata, Viewport } from "next";
import { Fustat, Inter } from "next/font/google";
import "./globals.css";

/** Manual de marca: Fustat (primaria) + Inter (secundaria / UI), vía theme.css en Figma Make. */
const fustat = Fustat({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  display: "swap",
  variable: "--font-sans",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = getSiteUrl();
const ogImagePath = "/images/og/default.jpg";
const ogImageUrl = getAbsoluteUrl(ogImagePath);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F5" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
  ],
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const verification: NonNullable<Metadata["verification"]> = {};
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const bing = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
  if (google) verification.google = google;
  if (bing) verification.other = { "msvalidate.01": bing };

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteConfig.defaultTitle,
      template: siteConfig.titleTemplate,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.legalName, url: siteUrl }],
    creator: siteConfig.legalName,
    publisher: siteConfig.legalName,
    category: "business",
    classification: "Business",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        "es-AR": siteUrl,
        es: siteUrl,
      },
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale.replace("_", "-"),
      alternateLocale: ["es"],
      url: siteUrl,
      siteName: siteConfig.name,
      title: siteConfig.defaultTitle,
      description: siteConfig.description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — licencias y marketplace oficial`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.defaultTitle,
      description: siteConfig.description,
      images: [ogImageUrl],
      ...(siteConfig.twitterHandle
        ? { site: siteConfig.twitterHandle, creator: siteConfig.twitterHandle }
        : {}),
    },
    icons: {
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    appleWebApp: {
      capable: true,
      title: siteConfig.name,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
    ...(Object.keys(verification).length > 0
      ? { verification: verification as Metadata["verification"] }
      : {}),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.language} className={`${fustat.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteJsonLd />
        {children}
      </body>
    </html>
  );
}
