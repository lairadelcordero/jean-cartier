import Link from "next/link";

const linkClass =
  "font-inter text-nav font-semibold uppercase tracking-ribbon text-jc-gray-700 transition hover:text-jc-gold";

/** Navegación pública mínima: un solo acceso interno para el equipo Jean Cartier (dueños / backoffice). */
export function SiteAccessNav() {
  const ownerLogin = `/auth/login?next=${encodeURIComponent("/admin")}`;

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-jc-gray-100 bg-jc-white/95 shadow-jc backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <Link
          href="/"
          className="font-sans text-sm font-heading tracking-menu text-jc-gold transition hover:text-jc-black"
        >
          JEAN CARTIER
        </Link>
        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6"
          aria-label="Navegación pública"
        >
          <Link href="/media-kit" className={linkClass}>
            Media Kit
          </Link>
          <Link href={ownerLogin} className={`${linkClass} text-jc-gold hover:text-jc-black`}>
            Acceso Jean Cartier
          </Link>
        </nav>
      </div>
    </header>
  );
}
