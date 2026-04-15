import Link from "next/link";

const cards = [
  {
    href: "/admin/licenciatarios",
    title: "Licenciatarios",
    desc: "Listado, búsqueda, filtros, perfil completo e historial de cambios.",
  },
  {
    href: "/admin/licenses",
    title: "Licencias",
    desc: "Alta pendiente, activación, expiración y renovaciones por licenciatario.",
  },
  {
    href: "/admin/documents",
    title: "Documentación",
    desc: "Carga, versionado y descarga de contratos, términos y compliance.",
  },
  {
    href: "/admin/commercial-terms",
    title: "Términos comerciales",
    desc: "Modelos de pago, historial de términos y registro de pagos.",
  },
  {
    href: "/admin/access-audit",
    title: "Access audit",
    desc: "Intentos de acceso, razones de denegación, IPs y exportables.",
  },
  {
    href: "/admin/users",
    title: "Usuarios admin",
    desc: "Gestión de roles internos y trazabilidad de acciones administrativas.",
  },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-3xl font-heading">Panel SUDO / Admin</h1>
      <p className="max-w-3xl text-jc-gray-700">
        Backoffice operativo para gestión de usuarios, licencias, clientes y documentación.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-jc-gray-100 bg-jc-white p-5 shadow-jc transition hover:border-jc-gold"
          >
            <h2 className="mb-1 text-lg font-semibold">{card.title}</h2>
            <p className="text-sm text-jc-gray-700">{card.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
