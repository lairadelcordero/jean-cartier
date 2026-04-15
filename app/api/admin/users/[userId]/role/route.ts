import { requireAdminApi } from "@/lib/admin/auth";
import { canAssignRole, editableRoles } from "@/lib/admin/permissions";
import { createServiceClient } from "@/lib/supabase/service";
import type { UserRole } from "@/types/database";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const { role: requesterRole, user: requester } = gate;
  const { userId } = await params;
  const body = (await request.json()) as { role?: UserRole };
  const role = body.role;

  if (!role || !editableRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: target, error: targetErr } = await service
    .from("users")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (targetErr || !target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (
    !canAssignRole({
      requesterRole,
      targetCurrentRole: target.role,
      nextRole: role,
      isSelf: requester.id === userId,
    })
  ) {
    return NextResponse.json({ error: "Role change not allowed" }, { status: 403 });
  }

  const { error } = await service.from("users").update({ role }).eq("id", userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await service.from("audit_logs").insert({
    actor_user_id: requester.id,
    action: "admin.user.role.update",
    entity_type: "users",
    entity_id: userId,
    metadata: { from: target.role, to: role },
  });

  return NextResponse.json({ data: { id: userId, role } });
}
