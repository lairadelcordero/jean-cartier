import { BrandManual } from "@/components/media-kit/brand-manual";
import { getAbsoluteUrl } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Kit y guías de estilo",
  description:
    "Manual de marca Jean Cartier: logos, colores, tipografía, espaciado, componentes y guías de uso. Contenido alineado al brand guide en Figma Make.",
  alternates: {
    canonical: getAbsoluteUrl("/media-kit"),
  },
};

export default function MediaKitPage() {
  return <BrandManual />;
}
