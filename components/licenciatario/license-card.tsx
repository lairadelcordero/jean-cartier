import { formatDateIso } from "@/lib/licenciatario/format";
import { licenseRef } from "@/lib/licenciatario/serializers";
import type { LicenseStatus } from "@/types/database";
import Link from "next/link";
import { LicenseStatusBadge } from "./status-badge";

export type LicenseCardData = {
  id: string;
  category: string;
  status: LicenseStatus;
  created_at: string;
  start_date: string | null;
  expiration_date: string | null;
  product_count: number;
};

export function LicenseCard({ license }: { license: LicenseCardData }) {
  const ref = licenseRef(license.id);
  return (
    <article className="flex flex-col rounded border border-jc-gray-100 bg-gradient-surface p-6 shadow-jc transition hover:shadow-lg">
      <div className="mb-4 border-l-4 border-jc-gold pl-3">
        <h3 className="font-sans text-title-sm font-heading capitalize text-jc-black">
          {license.category}
        </h3>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs text-jc-gray-500">{ref}</span>
          <LicenseStatusBadge status={license.status} />
        </div>
      </div>
      <div className="mb-3 rounded bg-jc-gray-50/80 px-3 py-2 text-sm text-jc-gray-700">
        <span className="font-medium text-jc-black">Vigencia: </span>
        {formatDateIso(license.start_date)} — {formatDateIso(license.expiration_date)}
      </div>
      <p className="mb-5 rounded bg-jc-gray-100 px-3 py-2 text-sm text-jc-gray-700">
        <span className="font-semibold text-jc-gold">{license.product_count} productos</span> en
        esta categoría
      </p>
      <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/licenciatario/licenses/${license.id}`}
          className="rounded border border-jc-gray-900 bg-jc-black px-4 py-2.5 text-center text-sm font-medium text-jc-white transition hover:bg-jc-gray-900"
        >
          Ver detalles
        </Link>
        <Link
          href={`/licenciatario/licenses/${license.id}/products`}
          className="rounded border border-jc-gray-300 bg-jc-gray-50 px-4 py-2.5 text-center text-sm font-medium text-jc-black transition hover:bg-jc-gray-100"
        >
          Gestionar productos
        </Link>
      </div>
    </article>
  );
}
