import { LicenseStatusBadge } from "@/components/licenciatario/status-badge";
import { assertOwnLicense } from "@/lib/licenciatario/auth";
import { formatDateIso, formatMoney } from "@/lib/licenciatario/format";
import { licenseRef } from "@/lib/licenciatario/serializers";
import { createClient } from "@/lib/supabase/server";
import type { LicenseStatus } from "@/types/database";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = { params: Promise<{ licenseId: string }> };

export default async function LicenseDetailPage({ params }: PageProps) {
  const { licenseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/licenciatario/dashboard");
  }

  const owns = await assertOwnLicense(supabase, user.id, licenseId);
  if (!owns) {
    notFound();
  }

  const { data: license, error: licErr } = await supabase
    .from("licenses")
    .select("*")
    .eq("id", licenseId)
    .single();

  if (licErr || !license) {
    notFound();
  }

  const { data: products } = await supabase
    .from("products")
    .select("status, price, stock")
    .eq("license_id", licenseId);

  let activeCount = 0;
  let inactiveCount = 0;
  let inventoryValue = 0;
  for (const p of products ?? []) {
    if (p.status === "active") activeCount += 1;
    else inactiveCount += 1;
    const price = Number(p.price ?? 0);
    const stock = p.stock ?? 0;
    if (Number.isFinite(price) && price > 0 && stock > 0) {
      inventoryValue += price * stock;
    }
  }
  inventoryValue = Math.round(inventoryValue * 100) / 100;

  const status = license.status as LicenseStatus;
  const ref = licenseRef(license.id);

  return (
    <>
      <Link
        href="/licenciatario/dashboard"
        className="mb-6 inline-flex text-sm font-medium text-jc-gold transition hover:text-jc-black"
      >
        ← Volver al portal
      </Link>

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-jc-gray-600">
        <Link href="/licenciatario/dashboard" className="text-jc-gold hover:underline">
          Mi portal
        </Link>
        <span className="text-jc-gray-300">/</span>
        <span className="text-jc-gray-900">{license.category}</span>
      </nav>

      <header className="mb-8 flex flex-col gap-4 border-b border-jc-gray-100 pb-8 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-sans text-display-sm font-display text-jc-black md:text-title-lg">
            Licencia: {license.category}
          </h1>
          <p className="mt-2 text-sm text-jc-gray-600">Detalles completos de tu licencia</p>
        </div>
        <LicenseStatusBadge status={status} />
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded border border-jc-gray-100 bg-gradient-surface p-6 shadow-jc">
            <h2 className="mb-4 border-b border-jc-gray-100 pb-3 font-sans text-title-sm font-heading text-jc-black">
              Información de la licencia
            </h2>
            <dl className="space-y-5">
              <div>
                <dt className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                  ID de licencia
                </dt>
                <dd className="mt-1 font-mono text-sm text-jc-gray-900">{ref}</dd>
              </div>
              <div>
                <dt className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                  Categoría
                </dt>
                <dd className="mt-1 capitalize text-jc-gray-900">{license.category}</dd>
              </div>
              <div>
                <dt className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                  Estado
                </dt>
                <dd className="mt-1 capitalize text-jc-gray-900">
                  {status === "active" ? "Activa" : status === "pending" ? "Pendiente" : "Inactiva"}
                </dd>
              </div>
              <div>
                <dt className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                  Vigencia
                </dt>
                <dd className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-nav text-jc-gray-500">Desde</p>
                    <p className="text-jc-gray-900">{formatDateIso(license.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-nav text-jc-gray-500">Hasta</p>
                    <p className="text-jc-gray-900">{formatDateIso(license.end_date)}</p>
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                  Creada el
                </dt>
                <dd className="mt-1 text-jc-gray-900">{formatDateIso(license.created_at)}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/licenciatario/licenses/${licenseId}/products`}
                className="rounded border border-jc-gray-900 bg-jc-black px-5 py-2.5 text-center text-sm font-medium text-jc-white transition hover:bg-jc-gray-900"
              >
                Gestionar productos
              </Link>
              <button
                type="button"
                disabled
                title="Próximamente"
                className="cursor-not-allowed rounded border border-jc-gray-200 bg-jc-gray-50 px-5 py-2.5 text-center text-sm font-medium text-jc-gray-400"
              >
                Descargar términos
              </button>
            </div>
          </section>
        </div>

        <aside className="rounded border border-jc-gray-100 bg-gradient-surface p-6 shadow-jc lg:border-l-4 lg:border-l-jc-gold">
          <div className="space-y-8 text-center">
            <div>
              <p className="font-sans text-3xl font-heading text-jc-gold">{activeCount}</p>
              <p className="mt-1 text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                Productos activos
              </p>
            </div>
            <div>
              <p className="font-sans text-3xl font-heading text-jc-gray-700">{inactiveCount}</p>
              <p className="mt-1 text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                Productos inactivos
              </p>
            </div>
            <div>
              <p className="font-sans text-3xl font-heading text-jc-gold">
                {formatMoney(inventoryValue)}
              </p>
              <p className="mt-1 text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                Valor total inventario
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
