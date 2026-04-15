import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { licenciatarioId } = await params;
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  const service = createServiceClient();
  let query = service
    .from("licenciatario_access_logs")
    .select("created_at, access_type, result, ip_address")
    .eq("licenciatario_id", licenciatarioId);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = data ?? [];

  const loginAttempts = rows.filter((row) => row.access_type === "login_attempt").length;
  const successful = rows.filter((row) => row.result === "success").length;
  const failed = rows.filter((row) => row.result !== "success").length;

  const dateCounts = new Map<string, number>();
  const hourCounts = new Map<number, number>();
  const ipSet = new Set<string>();
  for (const row of rows) {
    const date = new Date(row.created_at);
    const day = date.toISOString().slice(0, 10);
    const hour = date.getUTCHours();
    dateCounts.set(day, (dateCounts.get(day) ?? 0) + 1);
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    if (row.ip_address) ipSet.add(row.ip_address);
  }

  let mostActiveDate: string | null = null;
  let mostActiveDateCount = 0;
  for (const [day, count] of dateCounts.entries()) {
    if (count > mostActiveDateCount) {
      mostActiveDate = day;
      mostActiveDateCount = count;
    }
  }
  let mostActiveHour = 0;
  let mostActiveHourCount = 0;
  for (const [hour, count] of hourCounts.entries()) {
    if (count > mostActiveHourCount) {
      mostActiveHour = hour;
      mostActiveHourCount = count;
    }
  }

  return NextResponse.json({
    total_login_attempts: loginAttempts,
    successful_logins: successful,
    failed_login_attempts: failed,
    most_active_date: mostActiveDate,
    most_active_hour: mostActiveHour,
    unique_ip_addresses: ipSet.size,
    suspicious_activities: rows.filter((row) => row.result === "denied").length,
  });
}
