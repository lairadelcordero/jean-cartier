import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

const ALLOWED_STATUS = new Set(["active", "inactive", "expired"] as const);
type AllowedStatus = "active" | "inactive" | "expired";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string; licenseId: string }> }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const { licenciatarioId, licenseId } = await params;
  const body = (await request.json()) as { status?: AllowedStatus; notes?: string };

  if (!body.status || !ALLOWED_STATUS.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: existing, error: existingError } = await service
    .from("licenciatario_licenses")
    .select("*")
    .eq("id", licenseId)
    .eq("licenciatario_id", licenciatarioId)
    .maybeSingle();
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "License not found" }, { status: 404 });

  if (existing.status === "expired" && body.status === "expired") {
    return NextResponse.json(
      { error: "Cannot expire an already expired license" },
      { status: 400 }
    );
  }
  if (body.status === "active" && new Date(existing.expiration_date).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Cannot activate a license with expiration date in the past" },
      { status: 422 }
    );
  }

  const patch = {
    status: body.status,
    notes: body.notes?.trim() ?? existing.notes,
    last_modified_by: user.id,
    renewal_date:
      body.status === "active" && existing.status !== "active"
        ? new Date().toISOString().slice(0, 10)
        : existing.renewal_date,
  };

  const { data: updated, error } = await service
    .from("licenciatario_licenses")
    .update(patch)
    .eq("id", licenseId)
    .select("id, status, updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.license.status.update",
    entityType: "licenciatario_licenses",
    entityId: licenseId,
    metadata: { from: existing.status, to: patch.status },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    last_modified_date: updated.updated_at,
  });
}
