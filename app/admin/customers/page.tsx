import { AdminCustomersClient } from "@/components/admin/admin-customers-client";

export default function AdminCustomersPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-2xl font-heading">Clientes: compras, pagos y datos fiscales</h1>
      <AdminCustomersClient />
    </section>
  );
}
