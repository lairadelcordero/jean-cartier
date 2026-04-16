import { adminPatchLicense, type AdminPatchLicenseBody } from "@/lib/admin/licenses-mutations";
import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ licenseId: string }> }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const { licenseId } = await params;
  const body = (await request.json()) as AdminPatchLicenseBody;

  if (
    body.status === undefined &&
    body.licenciatario_id === undefined &&
    body.notes === undefined
  ) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const service = createServiceClient();
  const result = await adminPatchLicense(service, user.id, {
    licenseId,
    body,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const updated = result.updated;
  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    licenciatario_id: updated.licenciatario_id,
    last_modified_date: updated.updated_at,
  });
}
