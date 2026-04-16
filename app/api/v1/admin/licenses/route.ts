import {
  adminCreateLicense,
  type AdminCreateLicenseBody,
} from "@/lib/admin/licenses-mutations";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import type { LicenseStatus } from "@/types/database";
import { NextResponse } from "next/server";

function toInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

const LICENSE_STATUSES = new Set(["active", "inactive", "pending", "expired"] as const);

/** Lista `licenciatario_licenses` con filtros opcionales (incl. sin titular). */
export async function GET(request: Request) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;

  const { searchParams } = new URL(request.url);
  const status: LicenseStatus[] =
    searchParams
      .get("status")
      ?.split(",")
      .map((v) => v.trim())
      .filter((value): value is LicenseStatus => LICENSE_STATUSES.has(value as LicenseStatus)) ??
    [];
  const category =
    searchParams
      .get("category")
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean) ?? [];
  const dateFrom = searchParams.get("expiration_date_from");
  const dateTo = searchParams.get("expiration_date_to");
  const unassigned = searchParams.get("unassigned") === "1" || searchParams.get("unassigned") === "true";
  const licParam = searchParams.get("licenciatario_id")?.trim();
  const page = toInt(searchParams.get("page"), 1, 1, 999999);
  const limit = toInt(searchParams.get("limit"), 50, 1, 200);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const service = createServiceClient();
  let query = service
    .from("licenciatario_licenses")
    .select(
      "id, licenciatario_id, category, category_id, tier_id, exclusive, exclusive_scope, agreed_price, status, issue_date, expiration_date, renewal_date, created_at, created_by",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (unassigned) {
    query = query.is("licenciatario_id", null);
  } else if (licParam) {
    query = query.eq("licenciatario_id", licParam);
  }

  if (status.length > 0) query = query.in("status", status);
  if (category.length > 0) query = query.in("category", category);
  if (dateFrom) query = query.gte("expiration_date", dateFrom);
  if (dateTo) query = query.lte("expiration_date", dateTo);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const categoryIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.category_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    ),
  ];
  const tierIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.tier_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    ),
  ];
  const [categoriesRes, tiersRes] = await Promise.all([
    categoryIds.length > 0
      ? service.from("license_categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    tierIds.length > 0
      ? service.from("license_tiers").select("id, name").in("id", tierIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (categoriesRes.error)
    return NextResponse.json({ error: categoriesRes.error.message }, { status: 500 });
  if (tiersRes.error) return NextResponse.json({ error: tiersRes.error.message }, { status: 500 });
  const categoriesById = new Map((categoriesRes.data ?? []).map((row) => [row.id, row.name]));
  const tiersById = new Map((tiersRes.data ?? []).map((row) => [row.id, row.name]));

  return NextResponse.json({
    data: (data ?? []).map((row) => ({
      ...row,
      category_name: row.category_id
        ? (categoriesById.get(row.category_id) ?? row.category)
        : row.category,
      tier_name: row.tier_id ? (tiersById.get(row.tier_id) ?? null) : null,
    })),
    pagination: { page, limit, total: count ?? 0 },
  });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;

  const body = (await request.json()) as AdminCreateLicenseBody & {
    licenciatario_id?: string | null;
  };
  const { licenciatario_id: licRaw, ...createBody } = body;
  const licenciatarioId: string | null =
    licRaw === undefined || licRaw === null ? null : String(licRaw).trim() || null;

  const service = createServiceClient();
  const result = await adminCreateLicense(service, user.id, {
    licenciatarioId,
    body: createBody,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const created = result.created;
  return NextResponse.json(
    {
      id: created.id,
      category: created.category,
      status: created.status,
      issue_date: created.issue_date,
      expiration_date: created.expiration_date,
      created_date: created.created_at,
      licenciatario_id: created.licenciatario_id,
    },
    { status: 201 }
  );
}
