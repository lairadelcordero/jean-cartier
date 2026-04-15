import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

const METHODS = new Set(["bank_transfer", "credit_card", "check", "other"]);
const CURRENCIES = new Set(["ARS", "USD"]);
const PAYMENT_STATUSES = new Set(["received", "pending", "overdue"] as const);
type PaymentStatus = "received" | "pending" | "overdue";
type PaymentMethod = "bank_transfer" | "credit_card" | "check" | "other";
type PaymentCurrency = "ARS" | "USD";

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
  const rawStatus = searchParams.get("status");
  const status: PaymentStatus | null =
    rawStatus && PAYMENT_STATUSES.has(rawStatus as PaymentStatus) ? (rawStatus as PaymentStatus) : null;
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  const service = createServiceClient();
  let query = service
    .from("licenciatario_payments")
    .select("id, payment_date, amount, currency, payment_method, reference, status, recorded_at, recorded_by", {
      count: "exact",
    })
    .eq("licenciatario_id", licenciatarioId)
    .order("payment_date", { ascending: false })
    .range(from, to);
  if (status) query = query.eq("status", status);
  if (dateFrom) query = query.gte("payment_date", dateFrom);
  if (dateTo) query = query.lte("payment_date", dateTo);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data ?? [],
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
    payment_date?: string;
    amount?: number;
    currency?: PaymentCurrency;
    payment_method?: PaymentMethod;
    reference?: string;
    notes?: string;
  };

  if (!body.payment_date || !body.amount || !body.payment_method) {
    return NextResponse.json({ error: "payment_date, amount and payment_method are required" }, { status: 400 });
  }
  if (!METHODS.has(body.payment_method)) {
    return NextResponse.json({ error: "Invalid payment_method" }, { status: 400 });
  }
  if (body.currency && !CURRENCIES.has(body.currency)) {
    return NextResponse.json({ error: "Invalid currency. Allowed: ARS or USD" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("licenciatario_payments")
    .insert({
      licenciatario_id: licenciatarioId,
      payment_date: body.payment_date,
      amount: body.amount,
      currency: body.currency ?? "ARS",
      payment_method: body.payment_method,
      reference: body.reference?.trim() || null,
      status: "received",
      notes: body.notes?.trim() || null,
      recorded_by: user.id,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.payment.record",
    entityType: "licenciatario_payments",
    entityId: data.id,
    metadata: { licenciatario_id: licenciatarioId, amount: data.amount },
  });

  return NextResponse.json(
    {
      id: data.id,
      payment_date: data.payment_date,
      amount: data.amount,
      status: data.status,
      recorded_date: data.recorded_at,
    },
    { status: 201 }
  );
}
