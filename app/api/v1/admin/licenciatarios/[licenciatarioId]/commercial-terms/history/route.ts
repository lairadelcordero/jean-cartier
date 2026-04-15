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

  const service = createServiceClient();
  const { data, error, count } = await service
    .from("licenciatario_commercial_terms")
    .select(
      "id, payment_model, contract_type, billing_frequency, base_tariff_amount, currency, usd_ars_exchange_rate, installments_count, effective_date, end_date, created_at",
      { count: "exact" }
    )
    .eq("licenciatario_id", licenciatarioId)
    .order("effective_date", { ascending: false })
    .range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
  });
}
