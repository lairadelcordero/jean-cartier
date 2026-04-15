import { AdminDocumentsClient } from "@/components/admin/admin-documents-client";

export default function AdminDocumentsPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-sans text-2xl font-heading">Documentación de licenciatarios</h1>
      <p className="text-sm text-jc-gray-700">
        El rol editor/admin/sudo puede crear y actualizar documentación operativa.
      </p>
      <AdminDocumentsClient />
    </section>
  );
}
