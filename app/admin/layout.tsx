import { AdminHeader } from "@/components/admin/admin-header";
import { getAdminSession } from "@/lib/admin/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/licenciatarios", label: "Licenciatarios" },
  { href: "/admin/licenses", label: "Licencias" },
  { href: "/admin/documents", label: "Documentos" },
  { href: "/admin/commercial-terms", label: "Términos comerciales" },
  { href: "/admin/access-audit", label: "Access audit" },
  { href: "/admin/users", label: "Usuarios" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session.ok) {
    if (session.reason === "unauthenticated") {
      redirect("/auth/login?next=/admin");
    }
    redirect("/licenciatario/access-denied");
  }

  return (
    <div className="min-h-screen bg-gradient-page text-jc-black">
      <AdminHeader email={session.user.email ?? ""} role={session.role} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr] md:px-6">
        <aside className="h-fit rounded-xl border border-jc-gray-100 bg-jc-white p-3 shadow-jc">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded px-3 py-2 text-sm font-medium text-jc-gray-700 transition hover:bg-jc-gray-50 hover:text-jc-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
