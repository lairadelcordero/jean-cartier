import { AdminLicensesClient } from "@/components/admin/admin-licenses-client";

export default function AdminLicensesPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-2xl font-heading">Asignación de licencias</h1>
      <p className="text-sm text-jc-gray-700">
        Asigná categorías, niveles y exclusividad a usuarios con rol licenciatario.
      </p>
      <AdminLicensesClient />
    </section>
  );
}
