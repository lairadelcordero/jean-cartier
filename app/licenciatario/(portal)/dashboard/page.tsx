import { LicenseCard, type LicenseCardData } from "@/components/licenciatario/license-card";
import { createClient } from "@/lib/supabase/server";
import type { LicenseStatus } from "@/types/database";

export default async function LicenciatarioDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: licenseRows, error } = await supabase
    .from("licenses")
    .select("id, category, status, created_at, start_date, end_date")
    .eq("licenciatario_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        No se pudieron cargar las licencias.
      </div>
    );
  }

  const licenses = licenseRows ?? [];
  const licenseIds = licenses.map((l) => l.id);
  const countByLicense = new Map<string, number>();
  if (licenseIds.length > 0) {
    const { data: productLinks } = await supabase
      .from("products")
      .select("license_id")
      .in("license_id", licenseIds);
    for (const row of productLinks ?? []) {
      countByLicense.set(row.license_id, (countByLicense.get(row.license_id) ?? 0) + 1);
    }
  }

  const cards: LicenseCardData[] = licenses.map((row) => ({
    id: row.id,
    category: row.category,
    status: row.status as LicenseStatus,
    created_at: row.created_at,
    start_date: row.start_date,
    expiration_date: row.end_date,
    product_count: countByLicense.get(row.id) ?? 0,
  }));

  const activeCount = licenses.filter((l) => l.status === "active").length;
  const totalProducts = [...countByLicense.values()].reduce((a, b) => a + b, 0);

  return (
    <>
      <header className="mb-8">
        <h1 className="font-sans text-display-sm font-display text-jc-black md:text-title-lg">
          Mi portal
        </h1>
        <p className="mt-2 text-lead text-jc-gray-700">Gestiona tus licencias y productos</p>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-jc-gray-100 bg-gradient-surface p-4 shadow-jc md:p-5">
          <p className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
            Licencias activas
          </p>
          <p className="mt-2 font-sans text-3xl font-heading text-jc-gold">{activeCount}</p>
        </div>
        <div className="rounded border border-jc-gray-100 bg-gradient-surface p-4 shadow-jc md:p-5">
          <p className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
            Productos totales
          </p>
          <p className="mt-2 font-sans text-3xl font-heading text-jc-gold">{totalProducts}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-sans text-title-md font-heading text-jc-black">Mis licencias</h2>
        {cards.length === 0 ? (
          <div className="rounded border border-jc-gray-100 bg-gradient-surface py-16 text-center shadow-jc">
            <p className="font-sans text-title-sm font-heading text-jc-black">No tenés licencias</p>
            <p className="mt-2 text-sm text-jc-gray-600">
              Cuando tu licencia esté activa, vas a verla listada acá.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {cards.map((license) => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
