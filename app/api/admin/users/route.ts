import { requireAdminApi } from "@/lib/admin/auth";
import { editableRoles } from "@/lib/admin/permissions";
import { createServiceClient } from "@/lib/supabase/service";
import type { UserRole } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const service = createServiceClient();

  const { data: users, error } = await service
    .from("users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: users ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const { role: requesterRole, user: requester } = gate;
  const body = (await request.json()) as { email?: string; password?: string; role?: UserRole };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role ?? "customer";

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Invalid payload", message: "email and password(>=8) are required" },
      { status: 400 }
    );
  }
  if (!editableRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (role === "sudo" && requesterRole !== "sudo") {
    return NextResponse.json({ error: "Only sudo can assign sudo role" }, { status: 403 });
  }

  const service = createServiceClient();
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr || !created.user) {
    return NextResponse.json(
      { error: "Create user failed", message: createErr?.message ?? "Unknown error" },
      { status: 400 }
    );
  }

  const { error: upsertErr } = await service
    .from("users")
    .upsert({ id: created.user.id, email, role }, { onConflict: "id" });

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  await service.from("audit_logs").insert({
    actor_user_id: requester.id,
    action: "admin.user.create",
    entity_type: "users",
    entity_id: created.user.id,
    metadata: { role, email },
  });

  return NextResponse.json({ data: { id: created.user.id, email, role } }, { status: 201 });
}
