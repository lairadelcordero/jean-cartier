import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

const ACCESS_TYPES = new Set(["login_attempt", "portal_access", "data_view", "download"] as const);
type AccessType = "login_attempt" | "portal_access" | "data_view" | "download";
const RESULT_TYPES = new Set(["success", "denied", "error"] as const);
type ResultType = "success" | "denied" | "error";

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
  const accessType: AccessType[] =
    searchParams
      .get("access_type")
      ?.split(",")
      .map((value) => value.trim())
      .filter((value): value is AccessType => ACCESS_TYPES.has(value as AccessType)) ?? [];
  const rawResult = searchParams.get("result")?.trim();
  const result: ResultType | null =
    rawResult && RESULT_TYPES.has(rawResult as ResultType) ? (rawResult as ResultType) : null;
  const sortOrder = searchParams.get("sort_order") === "asc";

  const service = createServiceClient();
  let query = service
    .from("licenciatario_access_logs")
    .select(
      "id, created_at, access_type, result, ip_address, user_agent, denial_reason, admin_notes",
      {
        count: "exact",
      }
    )
    .eq("licenciatario_id", licenciatarioId)
    .order("created_at", { ascending: sortOrder })
    .range(from, to);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);
  if (accessType.length > 0) query = query.in("access_type", accessType);
  if (result) query = query.eq("result", result);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: (data ?? []).map((row) => ({
      id: row.id,
      timestamp: row.created_at,
      access_type: row.access_type,
      result: row.result,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      denial_reason: row.denial_reason,
      admin_notes: row.admin_notes,
    })),
    pagination: { page, limit, total: count ?? 0 },
  });
}
