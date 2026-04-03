import { requireLicenciatarioApi } from "@/lib/licenciatario/auth";
import { serializeLicenseListItem } from "@/lib/licenciatario/serializers";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireLicenciatarioApi();
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { supabase, user } = gate;

  const { data: licenses, error: licErr } = await supabase
    .from("licenses")
    .select("id, category, status, created_at, start_date, end_date, licenciatario_id")
    .eq("licenciatario_id", user.id)
    .order("created_at", { ascending: false });

  if (licErr) {
    return NextResponse.json({ error: "Server error", message: licErr.message }, { status: 500 });
  }

  const licenseIds = (licenses ?? []).map((l) => l.id);
  const countByLicense = new Map<string, number>();
  if (licenseIds.length > 0) {
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("license_id")
      .in("license_id", licenseIds);
    if (pErr) {
      return NextResponse.json({ error: "Server error", message: pErr.message }, { status: 500 });
    }
    for (const row of products ?? []) {
      countByLicense.set(row.license_id, (countByLicense.get(row.license_id) ?? 0) + 1);
    }
  }

  const data = (licenses ?? []).map((row) =>
    serializeLicenseListItem(row, countByLicense.get(row.id) ?? 0)
  );

  return NextResponse.json({ data });
}
