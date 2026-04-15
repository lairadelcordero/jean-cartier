import { AdminCommercialTermsClient } from "@/components/admin/admin-commercial-terms-client";

export default function AdminCommercialTermsPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-2xl font-heading">Términos comerciales y pagos</h1>
      <p className="text-sm text-jc-gray-700">
        Configuración de modelos de pago, versiones de términos y registro de cobros.
      </p>
      <AdminCommercialTermsClient />
    </section>
  );
}
