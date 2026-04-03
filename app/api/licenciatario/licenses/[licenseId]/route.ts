import { assertOwnLicense, requireLicenciatarioApi } from "@/lib/licenciatario/auth";
import { serializeLicenseDetail } from "@/lib/licenciatario/serializers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ licenseId: string }> };

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
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
    );
  }

  const { data: license, error: licErr } = await supabase
    .from("licenses")
    .select("*")
    .eq("id", licenseId)
    .single();

  if (licErr || !license) {
    return NextResponse.json(
      { error: "Not found", message: "License or product not found" },
      { status: 404 }
    );
  }

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("status, price, stock")
    .eq("license_id", licenseId);

  if (pErr) {
    return NextResponse.json({ error: "Server error", message: pErr.message }, { status: 500 });
  }

  let activeCount = 0;
  let inactiveCount = 0;
  let inventoryValue = 0;
  for (const p of products ?? []) {
    if (p.status === "active") activeCount += 1;
    else inactiveCount += 1;
    const price = Number(p.price ?? 0);
    const stock = p.stock ?? 0;
    if (Number.isFinite(price) && price > 0 && stock > 0) {
      inventoryValue += price * stock;
    }
  }

  const payload = serializeLicenseDetail(license, {
    productCount: products?.length ?? 0,
    activeCount,
    inactiveCount,
    inventoryValue: Math.round(inventoryValue * 100) / 100,
  });

  return NextResponse.json({ data: payload });
}
