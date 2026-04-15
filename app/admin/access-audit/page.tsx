import { AdminAccessAuditClient } from "@/components/admin/admin-access-audit-client";

export default function AdminAccessAuditPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-2xl font-heading">Access audit</h1>
      <p className="text-sm text-jc-gray-700">
        Monitoreo de intentos de acceso al portal, resultados y resumen por licenciatario.
      </p>
      <AdminAccessAuditClient />
    </section>
  );
}
