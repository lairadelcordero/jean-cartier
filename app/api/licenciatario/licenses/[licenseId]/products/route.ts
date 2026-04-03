import { assertOwnLicense, requireLicenciatarioApi } from "@/lib/licenciatario/auth";
import { validateProductInput } from "@/lib/licenciatario/product-validation";
import { serializeProduct } from "@/lib/licenciatario/serializers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ licenseId: string }> };

function isUniqueViolation(err: { code?: string } | null) {
  return err?.code === "23505";
}

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireLicenciatarioApi();
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { supabase, user } = gate;
  const { licenseId } = await context.params;

  const owns = await assertOwnLicense(supabase, user.id, licenseId);
  if (!owns) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You do not have permission to access this license" },
      { status: 401 }
    );
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("license_id", licenseId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: (products ?? []).map(serializeProduct) });
}

export async function POST(request: Request, context: RouteContext) {
  const gate = await requireLicenciatarioApi();
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { supabase, user } = gate;
  const { licenseId } = await context.params;

  const owns = await assertOwnLicense(supabase, user.id, licenseId);
  if (!owns) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You do not have permission to access this license" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Validation failed", details: [] }, { status: 400 });
  }

  const parsed = validateProductInput(body as Parameters<typeof validateProductInput>[0]);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.details },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("license_id", licenseId)
    .ilike("sku", parsed.data.sku)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: [{ field: "sku", message: "SKU already exists for this license" }],
      },
      { status: 400 }
    );
  }

  const { data: created, error } = await supabase
    .from("products")
    .insert({
      license_id: licenseId,
      name: parsed.data.name,
      sku: parsed.data.sku,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      status: parsed.data.status,
    })
    .select()
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: [{ field: "sku", message: "SKU must be unique within this license" }],
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Server error", message: "Failed to create product. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: serializeProduct(created) }, { status: 201 });
}
