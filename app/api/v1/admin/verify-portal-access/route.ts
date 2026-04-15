import { evaluatePortalAccess } from "@/lib/admin/portal-access";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    licenciatario_id?: string;
    ip_address?: string;
    user_agent?: string;
  };

  if (!body.licenciatario_id) {
    return NextResponse.json({ error: "licenciatario_id is required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: licenciatario, error: licError } = await service
    .from("licenciatarios")
    .select("id, archived, status")
    .eq("id", body.licenciatario_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (licError) return NextResponse.json({ error: licError.message }, { status: 500 });
  if (!licenciatario)
    return NextResponse.json({ error: "Licenciatario not found" }, { status: 404 });

  const { data: blockedIp, error: blockError } = await service
    .from("access_ip_blocks")
    .select("id")
    .eq("licenciatario_id", body.licenciatario_id)
    .eq("active", true)
    .eq("ip_address", body.ip_address ?? "")
    .maybeSingle();
  if (blockError) return NextResponse.json({ error: blockError.message }, { status: 500 });

  const { data: licenses, error: licenseError } = await service
    .from("licenciatario_licenses")
    .select("id, status, expiration_date")
    .eq("licenciatario_id", body.licenciatario_id)
    .order("expiration_date", { ascending: true });
  if (licenseError) return NextResponse.json({ error: licenseError.message }, { status: 500 });
  const active = (licenses ?? []).find((license) => license.status === "active");

  const result = evaluatePortalAccess({
    accountArchivedOrInactive: licenciatario.archived || licenciatario.status === "inactive",
    ipBlocked: Boolean(blockedIp),
    activeLicenseExpirationDate: active?.expiration_date ?? null,
    now: new Date(),
  });

  if (!result.access_granted && result.reason === "license_expired" && active) {
    await service
      .from("licenciatario_licenses")
      .update({ status: "expired" })
      .eq("id", active.id)
      .eq("status", "active");
  }

  await service.from("licenciatario_access_logs").insert({
    licenciatario_id: body.licenciatario_id,
    access_type: "portal_access",
    result: result.access_granted ? "success" : "denied",
    denial_reason: result.access_granted ? null : result.reason,
    ip_address: body.ip_address ?? null,
    user_agent: body.user_agent ?? null,
    admin_notes: null,
  });

  return NextResponse.json(result);
}
