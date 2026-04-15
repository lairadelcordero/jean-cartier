import type { LicenseStatus, ProductStatus } from "@/types/database";

const licenseLabels: Record<LicenseStatus, string> = {
  active: "Activa",
  inactive: "Inactiva",
  pending: "Pendiente",
  expired: "Expirada",
};

const productLabels: Record<ProductStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

function licenseClasses(s: LicenseStatus): string {
  if (s === "active") return "bg-emerald-100 text-emerald-800";
  if (s === "pending") return "bg-amber-100 text-amber-900";
  if (s === "expired") return "bg-rose-100 text-rose-800";
  return "bg-jc-gray-100 text-jc-gray-700";
}

function productClasses(s: ProductStatus): string {
  if (s === "active") return "bg-emerald-100 text-emerald-800";
  return "bg-jc-gray-100 text-jc-gray-600";
}

export function LicenseStatusBadge({ status }: { status: LicenseStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-0.5 text-nav font-medium uppercase tracking-ribbon ${licenseClasses(status)}`}
    >
      {licenseLabels[status]}
    </span>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-ribbon md:text-nav ${productClasses(status)}`}
    >
      {productLabels[status]}
    </span>
  );
}
