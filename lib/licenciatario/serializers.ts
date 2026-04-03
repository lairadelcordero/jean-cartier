import type { Database } from "@/types/database";

type LicenseRow = Database["public"]["Tables"]["licenses"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export function licenseRef(id: string): string {
  return `LIC-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

type LicenseListFields = Pick<
  LicenseRow,
  "id" | "category" | "status" | "created_at" | "start_date" | "end_date"
>;

export function serializeLicenseListItem(row: LicenseListFields, productCount: number) {
  return {
    id: row.id,
    category: row.category,
    status: row.status,
    created_at: row.created_at,
    start_date: row.start_date,
    expiration_date: row.end_date,
    product_count: productCount,
  };
}

export function serializeLicenseDetail(
  row: LicenseRow,
  stats: {
    productCount: number;
    activeCount: number;
    inactiveCount: number;
    inventoryValue: number;
  }
) {
  return {
    id: row.id,
    category: row.category,
    status: row.status,
    license_ref: licenseRef(row.id),
    created_at: row.created_at,
    start_date: row.start_date,
    expiration_date: row.end_date,
    fee_amount: row.fee_amount,
    commission_pct: row.commission_pct,
    product_count: stats.productCount,
    active_product_count: stats.activeCount,
    inactive_product_count: stats.inactiveCount,
    inventory_value: stats.inventoryValue,
  };
}

export function serializeProduct(row: ProductRow) {
  return {
    id: row.id,
    license_id: row.license_id,
    name: row.name,
    sku: row.sku,
    description: row.description,
    price: row.price,
    stock: row.stock,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
