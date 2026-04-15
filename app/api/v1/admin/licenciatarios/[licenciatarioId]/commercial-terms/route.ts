import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { assertDateOrder } from "@/lib/admin/validation";
import { NextResponse } from "next/server";

const CONTRACT_TYPES = new Set(["one_time", "installments"]);
const BILLING_FREQUENCIES = new Set(["monthly", "quarterly", "semiannual", "annual"]);
const CURRENCIES = new Set(["ARS", "USD"]);
const PAYMENT_MODELS = new Set(["monthly", "annual", "per_container", "per_quantity", "custom"] as const);
type PaymentModel = "monthly" | "annual" | "per_container" | "per_quantity" | "custom";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { licenciatarioId } = await params;
  const service = createServiceClient();

  const { data: terms, error } = await service
    .from("licenciatario_commercial_terms")
    .select("*")
    .eq("licenciatario_id", licenciatarioId)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!terms) return NextResponse.json({ error: "Commercial terms not found" }, { status: 404 });

  const { data: tiers } = await service
    .from("licenciatario_tariff_tiers")
    .select("quantity_from, quantity_to, price_per_unit")
    .eq("commercial_terms_id", terms.id)
    .order("quantity_from", { ascending: true });

  return NextResponse.json({
    id: terms.id,
    payment_model: terms.payment_model,
    contract_type: terms.contract_type ?? "installments",
    billing_frequency: terms.billing_frequency ?? "monthly",
    base_tariff_amount: terms.base_tariff_amount,
    currency: terms.currency,
    usd_ars_exchange_rate: terms.usd_ars_exchange_rate,
    installments_count: terms.installments_count,
    effective_date: terms.effective_date,
    end_date: terms.end_date,
    payment_due_day: terms.payment_due_day,
    tariff_tiers: tiers ?? [],
    created_date: terms.created_at,
    created_by: terms.created_by,
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
    contract_type?: "one_time" | "installments";
    billing_frequency?: "monthly" | "quarterly" | "semiannual" | "annual" | null;
    payment_model?: PaymentModel;
    base_tariff_amount?: number;
    currency?: "ARS" | "USD";
    usd_ars_exchange_rate?: number | null;
    installments_count?: number | null;
    effective_date?: string;
    end_date?: string | null;
    payment_due_day?: number | null;
    tariff_tiers?: Array<{ quantity_from: number; quantity_to: number | null; price_per_unit: number }>;
  };

  if (!body.contract_type || !CONTRACT_TYPES.has(body.contract_type)) {
    return NextResponse.json({ error: "Invalid contract_type" }, { status: 400 });
  }
  if (
    body.contract_type === "installments" &&
    (!body.billing_frequency || !BILLING_FREQUENCIES.has(body.billing_frequency))
  ) {
    return NextResponse.json({ error: "billing_frequency is required for installments contracts" }, { status: 400 });
  }
  if (body.contract_type === "one_time" && body.installments_count && body.installments_count > 1) {
    return NextResponse.json({ error: "one_time contracts cannot define installments_count > 1" }, { status: 422 });
  }
  if (!body.currency || !CURRENCIES.has(body.currency)) {
    return NextResponse.json({ error: "Invalid currency. Allowed: ARS or USD" }, { status: 400 });
  }
  if (body.currency === "USD" && (!body.usd_ars_exchange_rate || body.usd_ars_exchange_rate <= 0)) {
    return NextResponse.json({ error: "usd_ars_exchange_rate is required for USD contracts" }, { status: 400 });
  }
  if (!body.effective_date) {
    return NextResponse.json({ error: "effective_date is required" }, { status: 400 });
  }
  if (body.end_date && !assertDateOrder(body.effective_date, body.end_date)) {
    return NextResponse.json({ error: "end_date must be after effective_date" }, { status: 422 });
  }

  const tiers = body.tariff_tiers ?? [];
  for (let i = 0; i < tiers.length; i += 1) {
    const tier = tiers[i];
    if (tier.quantity_to !== null && tier.quantity_to <= tier.quantity_from) {
      return NextResponse.json({ error: "Invalid tariff tier range" }, { status: 422 });
    }
    if (i > 0) {
      const prev = tiers[i - 1];
      if (prev.quantity_to !== null && tier.quantity_from <= prev.quantity_to) {
        return NextResponse.json({ error: "Overlapping tariff tiers" }, { status: 422 });
      }
    }
  }

  const service = createServiceClient();
  const paymentModel: PaymentModel =
    body.payment_model && PAYMENT_MODELS.has(body.payment_model) ? body.payment_model : "custom";
  const { data: created, error } = await service
    .from("licenciatario_commercial_terms")
    .insert({
      licenciatario_id: licenciatarioId,
      payment_model: paymentModel,
      contract_type: body.contract_type,
      billing_frequency: body.contract_type === "installments" ? body.billing_frequency : null,
      base_tariff_amount: body.base_tariff_amount ?? 0,
      currency: body.currency,
      usd_ars_exchange_rate: body.currency === "USD" ? body.usd_ars_exchange_rate ?? null : null,
      installments_count:
        body.contract_type === "installments" ? (body.installments_count && body.installments_count > 0 ? body.installments_count : null) : null,
      effective_date: body.effective_date,
      end_date: body.end_date ?? null,
      payment_due_day: body.payment_due_day ?? null,
      created_by: user.id,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (tiers.length > 0) {
    await service.from("licenciatario_tariff_tiers").insert(
      tiers.map((tier) => ({
        commercial_terms_id: created.id,
        quantity_from: tier.quantity_from,
        quantity_to: tier.quantity_to,
        price_per_unit: tier.price_per_unit,
      }))
    );
  }

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.commercial_terms.create",
    entityType: "licenciatario_commercial_terms",
    entityId: created.id,
    metadata: {
      licenciatario_id: licenciatarioId,
      contract_type: body.contract_type,
      billing_frequency: body.billing_frequency,
      currency: body.currency,
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      payment_model: created.payment_model,
      contract_type: created.contract_type,
      billing_frequency: created.billing_frequency,
      effective_date: created.effective_date,
      created_date: created.created_at,
    },
    { status: 201 }
  );
}
