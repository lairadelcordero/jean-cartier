import { redirect } from "next/navigation";

/** Los documentos se gestionan desde la ficha de cada licenciatario. */
export default function AdminDocumentsRedirectPage() {
  redirect("/admin/licenciatarios");
}
