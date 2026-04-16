import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

function toInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

/** Global license registry for admin N2 list (all licenciatario_licenses). */
export async function GET(request: Request) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;

  const { searchParams } = new URL(request.url);
  const page = toInt(searchParams.get("page"), 1, 1, 999999);
  const limit = toInt(searchParams.get("limit"), 100, 1, 500);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const search = searchParams.get("search")?.trim() ?? "";

  const service = createServiceClient();
  let query = service
    .from("licenciatario_licenses")
    .select(
      "id, licenciatario_id, category, category_id, tier_id, exclusive, exclusive_scope, agreed_price, status, issue_date, expiration_date, renewal_date, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("category", `%${search}%`);
  }

  const { data: rows, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const licIds = [
    ...new Set(
      (rows ?? [])
        .map((r) => r.licenciatario_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];
  const catIds = [
    ...new Set(
      (rows ?? [])
        .map((r) => r.category_id)
        .filter((v): v is string => typeof v === "string" && v.length > 0)
    ),
  ];

  const [licRes, catRes] = await Promise.all([
    licIds.length > 0
      ? service.from("licenciatarios").select("id, razon_social, rut_cuit").in("id", licIds)
      : Promise.resolve({ data: [], error: null }),
    catIds.length > 0
      ? service.from("license_categories").select("id, name, slug, parent_id").in("id", catIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (licRes.error) return NextResponse.json({ error: licRes.error.message }, { status: 500 });
  if (catRes.error) return NextResponse.json({ error: catRes.error.message }, { status: 500 });

  const parentIds = [
    ...new Set(
      (catRes.data ?? [])
        .map((c) => c.parent_id)
        .filter((v): v is string => typeof v === "string" && v.length > 0)
    ),
  ];
  let parentById = new Map<string, string>();
  if (parentIds.length > 0) {
    const { data: parents, error: pErr } = await service
      .from("license_categories")
      .select("id, name")
      .in("id", parentIds);
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
    parentById = new Map((parents ?? []).map((p) => [p.id, p.name]));
  }

  const licById = new Map((licRes.data ?? []).map((l) => [l.id, l]));
  const catById = new Map((catRes.data ?? []).map((c) => [c.id, c]));

  const enriched = (rows ?? []).map((row) => {
    const lic = row.licenciatario_id ? licById.get(row.licenciatario_id) : undefined;
    const cat = row.category_id ? catById.get(row.category_id) : undefined;
    const parentName = cat?.parent_id ? (parentById.get(cat.parent_id) ?? null) : null;
    const categoryPath = cat
      ? parentName
        ? `${parentName} / ${cat.name}`
        : cat.name
      : row.category;
    return {
      ...row,
      licenciatario_razon_social: lic?.razon_social ?? null,
      licenciatario_rut_cuit: lic?.rut_cuit ?? null,
      category_path: categoryPath,
      parent_category_name: parentName,
    };
  });

  return NextResponse.json({
    data: enriched,
    pagination: { page, limit, total: count ?? enriched.length },
  });
}
