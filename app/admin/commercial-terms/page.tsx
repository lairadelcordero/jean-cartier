import { redirect } from "next/navigation";

/** Términos y pagos se gestionan desde la ficha de cada licenciatario. */
export default function AdminCommercialTermsRedirectPage() {
  redirect("/admin/licenciatarios");
}
