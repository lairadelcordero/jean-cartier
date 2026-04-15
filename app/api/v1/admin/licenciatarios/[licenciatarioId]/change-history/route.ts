import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

function toInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { licenciatarioId } = await params;
  const { searchParams } = new URL(request.url);

  const page = toInt(searchParams.get("page"), 1, 1, 999999);
  const limit = toInt(searchParams.get("limit"), 50, 1, 200);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const adminUserId = searchParams.get("admin_user_id");

  const service = createServiceClient();
  let query = service
    .from("licenciatario_change_history")
    .select("id, created_at, admin_user_id, field_name, old_value, new_value, change_type", {
      count: "exact",
    })
    .eq("licenciatario_id", licenciatarioId)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);
  if (adminUserId) query = query.eq("admin_user_id", adminUserId);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const adminIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.admin_user_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    ),
  ];
  const names = new Map<string, string>();
  if (adminIds.length > 0) {
    const { data: admins } = await service.from("users").select("id, email").in("id", adminIds);
    for (const admin of admins ?? []) names.set(admin.id, admin.email);
  }

  return NextResponse.json({
    data: (data ?? []).map((row) => ({
      id: row.id,
      timestamp: row.created_at,
      admin_user_id: row.admin_user_id,
      admin_name: row.admin_user_id ? (names.get(row.admin_user_id) ?? row.admin_user_id) : null,
      field_name: row.field_name,
      old_value: row.old_value,
      new_value: row.new_value,
      change_type: row.change_type,
    })),
    pagination: { page, limit, total: count ?? 0 },
  });
}
