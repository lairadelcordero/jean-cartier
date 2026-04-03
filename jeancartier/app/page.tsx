import { HomeHealthPanel } from "@/components/home/home-health-panel";
import Image from "next/image";

/** Descriptive alt for brand mark: SEO + screen readers (WCAG 2.2 1.1.1). */
const LOGO_ALT =
  "Jean Cartier: monograma JC, marca oficial de licencias y marketplace en Argentina.";

const WEBP_SRC_SET =
  "/images/brand/jc-monogram-64w.webp 64w, /images/brand/jc-monogram-128w.webp 128w, /images/brand/jc-monogram-256w.webp 256w, /images/brand/jc-monogram-512w.webp 512w";

export default function HomePage() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

  return (
    <>
      <a href="#contenido-principal" className="skip-to-content">
        Ir al contenido principal
      </a>
      <main
        id="contenido-principal"
        className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16"
      >
        <section className="mb-12 text-center" aria-labelledby="hero-heading">
          <div className="mx-auto mb-4 flex justify-center">
            <picture>
              <source
                type="image/webp"
                srcSet={WEBP_SRC_SET}
                sizes="(max-width: 640px) 80px, 128px"
              />
              <Image
                src="/images/brand/jc-monogram.png"
                alt={LOGO_ALT}
                width={512}
                height={512}
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 80px, 128px"
                className="h-20 w-20 rounded-2xl object-contain shadow-lg sm:h-28 sm:w-28"
              />
            </picture>
          </div>
          <h1 id="hero-heading" className="mb-2">
            Jean Cartier
          </h1>
          <HomeHealthPanel appEnv={appEnv} />
        </section>
      </main>
    </>
  );
}
