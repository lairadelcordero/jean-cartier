import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { assertDateOrder } from "@/lib/admin/validation";
import { createServiceClient } from "@/lib/supabase/service";
import type { LicenseStatus } from "@/types/database";
import { NextResponse } from "next/server";

function toInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

function overlapsScope(
  a: "none" | "production" | "import" | "both",
  b: "none" | "production" | "import" | "both"
) {
  if (a === "none" || b === "none") return true;
  if (a === "both" || b === "both") return true;
  return a === b;
}

const LICENSE_STATUSES = new Set(["active", "inactive", "pending", "expired"] as const);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { licenciatarioId } = await params;
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
  const page = toInt(searchParams.get("page"), 1, 1, 999999);
  const limit = toInt(searchParams.get("limit"), 50, 1, 200);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const service = createServiceClient();
  let query = service
    .from("licenciatario_licenses")
    .select(
      "id, category, category_id, tier_id, exclusive, exclusive_scope, agreed_price, status, issue_date, expiration_date, renewal_date, created_at, created_by",
      {
        count: "exact",
      }
    )
    .eq("licenciatario_id", licenciatarioId)
    .order("created_at", { ascending: false })
    .range(from, to);
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const { licenciatarioId } = await params;

  const body = (await request.json()) as {
    category?: string;
    category_id?: string;
    tier_id?: string;
    exclusive?: boolean;
    exclusive_scope?: "none" | "production" | "import" | "both";
    agreed_price?: number | null;
    issue_date?: string;
    expiration_date?: string;
    terms_accepted?: boolean;
    notes?: string;
  };

  if ((!body.category?.trim() && !body.category_id) || !body.issue_date || !body.expiration_date) {
    return NextResponse.json(
      { error: "category/category_id, issue_date and expiration_date are required" },
      { status: 400 }
    );
  }
  if (!assertDateOrder(body.issue_date, body.expiration_date)) {
    return NextResponse.json(
      { error: "expiration_date must be after issue_date" },
      { status: 422 }
    );
  }

  const service = createServiceClient();
  let normalizedCategory = body.category?.trim() ?? "";
  const categoryId = body.category_id ?? null;
  if (categoryId) {
    const { data: categoryRow, error: categoryErr } = await service
      .from("license_categories")
      .select("id, name")
      .eq("id", categoryId)
      .eq("active", true)
      .maybeSingle();
    if (categoryErr) return NextResponse.json({ error: categoryErr.message }, { status: 500 });
    if (!categoryRow) return NextResponse.json({ error: "category_id not found" }, { status: 422 });
    normalizedCategory = categoryRow.name;
  }

  const tierId = body.tier_id ?? null;
  if (tierId) {
    const { data: tierRow, error: tierErr } = await service
      .from("license_tiers")
      .select("id")
      .eq("id", tierId)
      .eq("active", true)
      .maybeSingle();
    if (tierErr) return NextResponse.json({ error: tierErr.message }, { status: 500 });
    if (!tierRow) return NextResponse.json({ error: "tier_id not found" }, { status: 422 });
  }

  const incomingScope: "none" | "production" | "import" | "both" = body.exclusive
    ? (body.exclusive_scope ?? "both")
    : "none";
  const validityStartDate = body.issue_date;

  let conflictsQuery = service
    .from("licenciatario_licenses")
    .select("id, licenciatario_id, exclusive, exclusive_scope, status, expiration_date")
    .in("status", ["active", "pending"])
    .gte("expiration_date", validityStartDate)
    .neq("licenciatario_id", licenciatarioId);

  if (categoryId) {
    conflictsQuery = conflictsQuery.eq("category_id", categoryId);
  } else {
    conflictsQuery = conflictsQuery.eq("category", normalizedCategory);
  }

  const { data: conflictingLicenses, error: conflictsError } = await conflictsQuery;
  if (conflictsError) return NextResponse.json({ error: conflictsError.message }, { status: 500 });

  const otherActiveLicenses = conflictingLicenses ?? [];
  const existingExclusive = otherActiveLicenses.filter(
    (row) =>
      row.exclusive &&
      overlapsScope(
        (row.exclusive_scope as "none" | "production" | "import" | "both") ?? "both",
        incomingScope
      )
  );

  if (body.exclusive && otherActiveLicenses.length > 0) {
    return NextResponse.json(
      {
        error:
          "No se puede crear una licencia exclusiva: ya existe una licencia vigente de este rubro para otro licenciatario",
      },
      { status: 409 }
    );
  }

  if (!body.exclusive && existingExclusive.length > 0) {
    return NextResponse.json(
      {
        error:
          "No se puede crear licencia no exclusiva: este rubro ya esta reservado en exclusividad para otro licenciatario",
      },
      { status: 409 }
    );
  }

  const { data: created, error } = await service
    .from("licenciatario_licenses")
    .insert({
      licenciatario_id: licenciatarioId,
      category: normalizedCategory,
      category_id: categoryId,
      tier_id: tierId,
      exclusive: Boolean(body.exclusive),
      exclusive_scope: body.exclusive ? (body.exclusive_scope ?? "both") : "none",
      agreed_price: body.agreed_price ?? null,
      status: "pending",
      issue_date: body.issue_date,
      expiration_date: body.expiration_date,
      terms_accepted: Boolean(body.terms_accepted),
      notes: body.notes?.trim() || null,
      created_by: user.id,
      last_modified_by: user.id,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.license.create",
    entityType: "licenciatario_licenses",
    entityId: created.id,
    metadata: {
      licenciatario_id: licenciatarioId,
      category: created.category,
      category_id: created.category_id,
      tier_id: created.tier_id,
      exclusive: created.exclusive,
      exclusive_scope: created.exclusive_scope,
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      category: created.category,
      status: created.status,
      issue_date: created.issue_date,
      expiration_date: created.expiration_date,
      created_date: created.created_at,
    },
    { status: 201 }
  );
}
