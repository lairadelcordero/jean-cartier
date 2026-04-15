import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { customerId } = await params;

  const service = createServiceClient();

  const [userResult, taxResult, ordersResult, paymentsResult] = await Promise.all([
    service.from("users").select("id, email, role, created_at").eq("id", customerId).maybeSingle(),
    service.from("customer_tax_profiles").select("*").eq("user_id", customerId).maybeSingle(),
    service
      .from("orders")
      .select("id, user_id, status, total, created_at")
      .eq("user_id", customerId)
      .order("created_at", { ascending: false })
      .limit(100),
    service
      .from("payments")
      .select(
        "id, order_id, provider, amount, currency, status, external_reference, paid_at, created_at"
      )
      .eq("user_id", customerId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (userResult.error || !userResult.data) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const orderIds = (ordersResult.data ?? []).map((order) => order.id);
  let items: Array<{
    order_id: string;
    product_id: string;
    quantity: number;
    price: number | null;
  }> = [];
  if (orderIds.length > 0) {
    const itemsResult = await service
      .from("order_items")
      .select("order_id, product_id, quantity, price")
      .in("order_id", orderIds);
    items = itemsResult.data ?? [];
  }

  return NextResponse.json({
    data: {
      customer: userResult.data,
      tax_profile: taxResult.data ?? null,
      orders: ordersResult.data ?? [],
      order_items: items,
      payments: paymentsResult.data ?? [],
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user: requester } = gate;
  const { customerId } = await params;
  const body = (await request.json()) as {
    legal_name?: string | null;
    tax_id?: string | null;
    tax_condition?: string | null;
    billing_address?: string | null;
    city?: string | null;
    country?: string | null;
    postal_code?: string | null;
  };

  const service = createServiceClient();
  const payload = {
    user_id: customerId,
    legal_name: body.legal_name ?? null,
    tax_id: body.tax_id ?? null,
    tax_condition: body.tax_condition ?? null,
    billing_address: body.billing_address ?? null,
    city: body.city ?? null,
    country: body.country ?? null,
    postal_code: body.postal_code ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await service
    .from("customer_tax_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("audit_logs").insert({
    actor_user_id: requester.id,
    action: "admin.customer.tax_profile.update",
    entity_type: "customer_tax_profiles",
    entity_id: customerId,
    metadata: payload,
  });

  return NextResponse.json({ data });
}
