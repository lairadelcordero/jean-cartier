import { SiteAccessNav } from "@/components/site/site-access-nav";
import Link from "next/link";

export default function LicenciatarioAccessDeniedPage() {
  return (
    <>
      <SiteAccessNav />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-page px-6 pb-12 pt-24 font-inter text-jc-black sm:pt-28">
        <p className="mb-2 text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">403</p>
        <h1 className="mb-4 text-center font-sans text-display-sm font-heading text-jc-black">
          Acceso denegado
        </h1>
        <p className="mb-8 max-w-md text-center text-body text-jc-gray-700">
          No tenés permiso para acceder a este portal. Si creés que es un error, contactá al equipo
          Jean Cartier.
        </p>
        <Link
          href="/"
          className="rounded border border-jc-gray-900 bg-jc-black px-5 py-2.5 text-sm font-medium text-jc-white shadow-jc transition hover:bg-jc-gray-900"
        >
          Volver al inicio
        </Link>
      </main>
    </>
  );
}
