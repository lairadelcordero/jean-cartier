import Link from "next/link";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineArticle,
  MdOutlineDescription,
  MdOutlineGroup,
  MdOutlinePayments,
  MdOutlineSpaceDashboard,
} from "react-icons/md";

const modules = [
  {
    href: "/admin/licenses",
    title: "Licencias",
    desc: "Listado global por rubro, jerarquía de categorías, asignación y estados.",
    icon: MdOutlineArticle,
  },
  {
    href: "/admin/licenciatarios",
    title: "Licenciatarios",
    desc: "Altas, fichas, checklist de activación y documentación asociada.",
    icon: MdOutlineGroup,
  },
  {
    href: "/admin/documents",
    title: "Documentos",
    desc: "Contratos, términos y compliance por licenciatario.",
    icon: MdOutlineDescription,
  },
  {
    href: "/admin/commercial-terms",
    title: "Términos y pagos",
    desc: "Contratos en ARS/USD, historial y registro de cobros con tipo de cambio por pago.",
    icon: MdOutlinePayments,
  },
  {
    href: "/admin/users",
    title: "Usuarios",
    desc: "Roles internos sudo/admin y trazabilidad.",
    icon: MdOutlineAdminPanelSettings,
  },
];

export default function AdminHomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-6 shadow-jc">
        <div className="flex flex-wrap items-start gap-3">
          <MdOutlineSpaceDashboard className="mt-0.5 h-8 w-8 text-jc-gold" aria-hidden />
          <div>
            <h1 className="font-sans text-2xl font-heading text-jc-black">Panel administrativo</h1>
            <p className="mt-1 max-w-2xl text-sm text-jc-gray-700">
              Operación de licencias, licenciatarios y usuarios. La auditoría de acceso al portal de
              licenciatarios se habilitará cuando exista login en ese portal.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex gap-4 rounded-xl border border-jc-gray-100 bg-jc-white p-5 shadow-jc transition hover:border-jc-gold"
          >
            <card.icon className="h-10 w-10 shrink-0 text-jc-gray-400 transition group-hover:text-jc-gold" />
            <div>
              <h2 className="mb-1 text-lg font-semibold text-jc-black">{card.title}</h2>
              <p className="text-sm text-jc-gray-700">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
