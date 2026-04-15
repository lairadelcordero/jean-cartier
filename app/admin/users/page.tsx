import { AdminUsersClient } from "@/components/admin/admin-users-client";

export default function AdminUsersPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-2xl font-heading">Usuarios y permisos</h1>
      <p className="text-sm text-jc-gray-700">
        Crear usuarios, administrar roles y controlar acceso a paneles.
      </p>
      <AdminUsersClient />
    </section>
  );
}
