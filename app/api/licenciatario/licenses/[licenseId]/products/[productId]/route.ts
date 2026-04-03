import { assertOwnLicense, requireLicenciatarioApi } from "@/lib/licenciatario/auth";
import { validateProductInput } from "@/lib/licenciatario/product-validation";
import { serializeProduct } from "@/lib/licenciatario/serializers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ licenseId: string; productId: string }> };

function isUniqueViolation(err: { code?: string } | null) {
  return err?.code === "23505";
}

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireLicenciatarioApi();
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { supabase, user } = gate;
  const { licenseId, productId } = await context.params;

  const owns = await assertOwnLicense(supabase, user.id, licenseId);
  if (!owns) {
    return NextResponse.json(
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
    );
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("license_id", licenseId)
    .maybeSingle();

  if (error || !product) {
    return NextResponse.json(
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: serializeProduct(product) });
}

export async function PUT(request: Request, context: RouteContext) {
  const gate = await requireLicenciatarioApi();
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { supabase, user } = gate;
  const { licenseId, productId } = await context.params;

  const owns = await assertOwnLicense(supabase, user.id, licenseId);
  if (!owns) {
    return NextResponse.json(
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
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
    .neq("id", productId)
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

  const { data: updated, error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      sku: parsed.data.sku,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      status: parsed.data.status,
    })
    .eq("id", productId)
    .eq("license_id", licenseId)
    .select()
    .maybeSingle();

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
      { error: "Server error", message: "Failed to update product. Please try again." },
      { status: 500 }
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: serializeProduct(updated) });
}

/** Soft deactivate: set status to inactive (REQ-2). */
export async function DELETE(_request: Request, context: RouteContext) {
  const gate = await requireLicenciatarioApi();
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { supabase, user } = gate;
  const { licenseId, productId } = await context.params;

  const owns = await assertOwnLicense(supabase, user.id, licenseId);
  if (!owns) {
    return NextResponse.json(
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
    );
  }

  const { data: updated, error } = await supabase
    .from("products")
    .update({ status: "inactive" })
    .eq("id", productId)
    .eq("license_id", licenseId)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Server error", message: "Failed to update product. Please try again." },
      { status: 500 }
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: serializeProduct(updated) });
}
