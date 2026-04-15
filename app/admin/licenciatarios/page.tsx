import { AdminLicenciatariosClient } from "@/components/admin/admin-licenciatarios-client";

export default function AdminLicenciatariosPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-2xl font-heading">Gestión de licenciatarios</h1>
      <p className="text-sm text-jc-gray-700">
        Alta, búsqueda, filtros, edición de perfil y consulta de historial de cambios.
      </p>
      <AdminLicenciatariosClient />
    </section>
  );
}
